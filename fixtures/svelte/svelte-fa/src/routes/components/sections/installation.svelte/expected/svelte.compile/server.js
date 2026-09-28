import * as $ from 'svelte/internal/server';
import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

export default function Installation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DocsTitle($$renderer, { title: 'Installation' });
		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.installation[0] });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">Install FontAwesome icons via <a href="https://www.npmjs.com/search?q=%40fortawesome%20svg%20icons" target="_blank">official packages</a>, for example:</div> `);
		DocsCode($$renderer, { code: codes.installation[1] });

		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded"><strong>Notice for <a href="https://sapper.svelte.dev/" target="_blank">Sapper</a> user:</strong> You
  may need to install the component as a devDependency:</div> `);

		DocsCode($$renderer, { code: codes.installation[2] });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded"><strong>Notice for <a href="https://kit.svelte.dev/" target="_blank">SvelteKit</a>/<a href="https://www.npmjs.com/package/vite" target="_blank">Vite</a> user:</strong> You may need to import the component explicitly as below:</div> `);
		DocsCode($$renderer, { code: codes.installation[3], lang: 'js' });

		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">When using typescript with SvelteKit/Vite, you may also needed to add type definitions that
  redirect to the non-index.es export:</div> `);

		DocsCode($$renderer, { code: codes.installation[4], lang: 'js' });
		$$renderer.push(`<!---->`);
	});
}