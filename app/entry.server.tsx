// @ts-expect-error virtual module
// eslint-disable-next-line import/no-unresolved
export { default } from "virtual:netlify-server-entry";
import '@valtown/sdk/shims/web'


if(Deno ){
 Object.entries(Deno.env.toObject()).forEach(([key,value])=>{
    import.meta.env[key]=value
 })

}