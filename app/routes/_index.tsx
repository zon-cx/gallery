import '@valtown/sdk/shims/web';
import { useLoaderData, Link } from '@remix-run/react';
import { FolderKanban as ZonsIcon, Star, GitFork, Globe, User } from 'lucide-react';

import ValTown from '@valtown/sdk';
import { Val } from '@valtown/sdk/resources';
import { MetaFunction } from '@netlify/remix-runtime';



export const meta: MetaFunction = () => {
  return [
    { title: "Zon" },
    { name: "description", content: "Welcome to Zon" },
  ];
};

export async function loader() {
  const valtown = new ValTown({bearerToken: import.meta.env.VAL_TOWN_API_KEY || Deno.env.get('VAL_TOWN_API_KEY')});
  const vals = await valtown.me.vals.list({
    limit: 100,
    offset: 0
  });

  return {
    zons: vals.data.map((val) => ({
      ...val,
      likeCount: 0,
      referenceCount: 0
    }))
  };
}

interface ZonCardProps {
  zon: Val & { likeCount: number; referenceCount: number };
}

function ZonCard({ zon }: ZonCardProps) {
   
  return (
    <Link
      to={`/${zon.name}/files`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {zon.name}
            </h3>
          </div>
        </div>
        <div className="text-sm text-gray-500 mb-4 line-clamp-2">
          {zon.description && (
            <pre className="font-mono text-xs bg-gray-50 p-2 rounded overflow-hidden">
              {zon.description.slice(0, 100)}...
            </pre>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              <span>{zon.likeCount || 0}</span>
            </div>
            <div className="flex items-center">
              <GitFork className="h-4 w-4 mr-1" />
              <span>{zon.referenceCount || 0}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{zon.author.username || ''}</span>
            </div>
          </div>

          <div className="flex flex-col items-end text-xs">
            <div>Created: {new Date(zon.createdAt || '').toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Zons() {
  const { zons } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <ZonsIcon className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold">Zons</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zons.map((zon) => (
          <ZonCard key={zon.id} zon={zon} />
        ))}
      </div>
    </div>
  );
} 