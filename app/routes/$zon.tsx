import '@valtown/sdk/shims/web';
import { Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import ValTown from '@valtown/sdk';

export async function loader({ params }: LoaderFunctionArgs) {
  const { zon } = params;
  if (!zon) {
    throw new Error("Missing zon parameter");
  }
  const client = new ValTown({bearerToken: Deno.env.get('VAL_TOWN_API_KEY')});
  const zons = await client.me.vals.list({
    limit: 100,
    offset: 0,
  });

  return zons.data.find((z) => z.name === zon);

}

export default function ZonLayout() {
  const {id, description,name,links } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>
        <Outlet context={{ zon: {id, description,name,links} }}/>
      </div>
    </div>
  );
} 