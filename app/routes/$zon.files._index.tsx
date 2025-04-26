import "@valtown/sdk/shims/web";
import {   useLoaderData, Link } from "@remix-run/react";
import {
  LayoutDashboard as GalleryIcon,
  Code2,
  Star,
  GitFork,
  FileText,
  Mail,
  Clock,
  Folder,
  FileIcon
} from "lucide-react";
import ValTown from "@valtown/sdk";
import { FileRetrieveResponse } from "@valtown/sdk/resources/vals";
import type { LoaderFunctionArgs } from "@remix-run/node";


export async function loader({ params }: LoaderFunctionArgs) {
  const client = new ValTown({bearerToken: import.meta.env.VAL_TOWN_API_KEY || Deno.env.get('VAL_TOWN_API_KEY')});
  // Get files
  const {id:zon} = await client.me.vals.list({
    limit: 100,
    offset: 0
  }).then(res => res.data).then(files => files.find((z) => z.name === params.zon)) || {id: ""};

  const files = await client.vals.files.retrieve(zon, {
    path: "",
    recursive: true,
  }).then(res => res.data)

  return {
    files: files.map((file) => ({
      ...file,
      likeCount: 0,
      referenceCount: 0,
    })),
    zon:params.zon,
  };
}

interface FileItemProps {
  file: FileRetrieveResponse & { likeCount: number; referenceCount: number };
}

function FileBadge({
  type,
  icon,
  name,
  bgColor,
  textColor,
}: {
  type: string;
  icon: JSX.Element;
  name: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        {icon}
        <h3 className="text-lg font-medium text-gray-900 truncate">{name}</h3>
      </div>
      <div className="flex items-center space-x-2">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}
        >
          {type}
        </span>
      </div>
    </div>
  );
}

const FileCards = {
  http: function HttpFile({ file }: FileItemProps) {
    return (
      <Link
        to={`./${file.name}`}
        className="p-4 block"
      >
        <FileBadge
          type={"http"}
          icon={<Code2 className="h-5 w-5 text-blue-500" />}
          name={file.name}
          bgColor="bg-blue-100"
          textColor="text-blue-800"
        />
        <FileFooter file={file} />
      </Link>
    );
  },
  email:function EmailFile({ file }: FileItemProps) {
    return (
      <div className="p-4">
        <FileBadge
          type={"email"}
          icon={<Mail className="h-5 w-5 text-purple-500" />}
          name={file.name}
          bgColor="bg-purple-100"
          textColor="text-purple-800"
        />
        <FileFooter file={file} />
      </div>
    );
  } ,
  interval:   function IntervalFile({ file }: FileItemProps) {
    return (
      <div className="p-4">
        <FileBadge
          type={"interval"}
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          name={file.name}
          bgColor="bg-orange-100"
          textColor="text-orange-800"
        />
        <FileFooter file={file} />
      </div>
    );
  },

  script: function ScriptFile({ file }: FileItemProps) {
    return (
      <div className="p-4">
        <FileBadge
          type={"script"}
          icon={<FileText className="h-5 w-5 text-green-500" />}
          name={file.name}
          bgColor="bg-green-100"
          textColor="text-green-800"
        />
        <FileFooter file={file} />
      </div>
    );
  },
  directory: function DirectoryFile({ file }: FileItemProps) {
    return (
      <div className="p-4">
        <FileBadge
          type={"directory"}
          icon={<Folder className="h-5 w-5 text-gray-500" />}
          name={file.name}
          bgColor="bg-gray-100"
          textColor="text-gray-800"
        />
      </div>
    );
  },
  file: function FileFile({ file }: FileItemProps) {
    return (
      <div className="p-4">
        <FileBadge
          type={"file"}
          icon={<FileIcon className="h-5 w-5 text-gray-500" />}
          name={file.name}
          bgColor="bg-gray-100"
          textColor="text-gray-800"
        />
      </div>
    );
  },
};

function FileFooter({
  file,
}: {
  file: FileRetrieveResponse & { likeCount: number; referenceCount: number };
}) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1" />
          <span>{file.likeCount || 0}</span>
        </div>
        <div className="flex items-center">
          <GitFork className="h-4 w-4 mr-1" />
          <span>{file.referenceCount || 0}</span>
        </div>
      </div>
      <div className="flex flex-col items-end text-xs">
        {file.updatedAt && (
          <div>Updated: {new Date(file.updatedAt).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
}

export default function ZonDetail() {
  const { files, zon } = useLoaderData<typeof loader>();
 
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <GalleryIcon className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold">Files in {zon}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
          >
            {FileCards[file.type as keyof typeof FileCards]?.({ file }) ?? <div>Unknown file type {file.type}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
