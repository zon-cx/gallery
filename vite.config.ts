import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyPlugin } from "@netlify/remix-edge-adapter/plugin";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
 
  resolve: {
    alias: {
      "@cxai/ide": 'https://esm.sh/@cxai/ide@1.0.19',
      "@cxai/ide/*": 'https://esm.sh/@cxai/ide/$1',
    }
  },
  plugins: [remix({
    future: {
      v3_singleFetch: true,
      v3_throwAbortReason: true
    },

  }), netlifyPlugin(), tsconfigPaths(), tailwindcss()],
});
