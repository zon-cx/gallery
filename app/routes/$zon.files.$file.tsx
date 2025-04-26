import '@valtown/sdk/shims/web'
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit, Await } from "@remix-run/react";
import { Code2, Save } from "lucide-react";
import { useCallback, useRef, useEffect, Suspense } from "react";
import ValTown from "@valtown/sdk";
import type { HTMLTypeScriptEditor } from "@cxai/ide";
   
 
declare global {
 
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ts-editor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLTypeScriptEditor>, HTMLTypeScriptEditor> & {
        component?: string;
        room?: string;
        value?: string;
        url?: string;
      };
    }
  }
}

const client = new ValTown();



 

export async function loader({ params }: LoaderFunctionArgs) {
  const { file: name } = params;
  const zon = await client.me.vals.list({
    limit: 100,
    offset: 0
  }).then(res => res.data).then(files => files.find((z) => z.name === params.zon)) 

  const file = await client.vals.files.retrieve(zon?.id || "", {
    path: name!,
    recursive: false
  }).then(res => res.data[0]);

  if (!file || !zon) {
    throw new Error(`File '${name}' not found` , { cause: { file, zon } });
  }
 
  return {
    zon,
    file,
    content: client.vals.files.getContent(zon.id, { path: file.path }).then(res => res.text()).then(text => {
      console.debug(text.slice(0, 50)+ "...");
      return text;
    }),
  };
}



export async function action({ request,params }: ActionFunctionArgs) { 
  const formData = await request.formData();
  const content = formData.get("content") as string;
  const { file } = params; 
  const zon = await client.me.vals.list({
    limit: 100,
    offset: 0
  }).then(res => res.data).then(files => files.find((z) => z.name === params.zon)) || {id: ""};

  if (!file || !zon) {
    throw new Error("Missing required parameters", { cause: { file, zon } });
  }
  return await client.vals.files.update(zon.id, {
    path: file,
    content: content
  });

}


export default function FileEditor() {
  const { file, content, zon} = useLoaderData<typeof loader>();
  
  const editorRef = useRef<HTMLTypeScriptEditor>(null);
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const submit = useSubmit(); 

  const handleSubmit = useCallback(() => {
    if (!editorRef.current) throw new Error("Editor not ready yet.");
    const formData = new FormData();
    formData.append("content", editorRef.current.value);
    submit(formData, { method: "post", viewTransition: true });
  }, [submit]);
 

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code2 className="h-6 w-6 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900">{file.name}</h1>
            </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className={`flex items-center px-4 py-2 rounded-md text-white ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
          </div>
        </div>
        <div className="h-[calc(100vh-12rem)] w-full">
          <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading editor…</div>}>
            <Await resolve={content}>
              {(resolvedContent) => {
                return <TSEditor zon={zon.name} file={file.path} content={resolvedContent as string} />
              }}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
} 

export  function TSEditor({zon, file, content}: {zon: string, file: string, content: string}) {
  const editorRef = useRef<HTMLTypeScriptEditor>(null);

  useEffect(() => {
    if(editorRef.current && content){
      editorRef.current.value = content;
    }
  }, [content]);

  return <ts-editor
    ref={editorRef}
    component="codemirror"
    room={`val-${zon}-${file}`}
    className="h-full w-full"
    url={import.meta.env.VITE_YJS_URL || "wss://yjs.cfapps.us10-001.hana.ondemand.com"}
  /> ;
} 

