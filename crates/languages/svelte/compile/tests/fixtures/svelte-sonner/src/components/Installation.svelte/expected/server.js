import * as $ from 'svelte/internal/server';
import copy from 'copy-to-clipboard';

export default function Installation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let copying = 0;

		function onCopy() {
			copy('npm install svelte-sonner');
			copying++;

			setTimeout(
				() => {
					copying--;
				},
				2000
			);
		}

		$$renderer.push(`<div><h2>Installation</h2>  <code class="code svelte-ieftj0">npm install svelte-sonner <button aria-label="Copy code" class="copy svelte-ieftj0">`);

		if (copying) {
			$$renderer.push(`<!--[0--><div class="svelte-ieftj0"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M20 6L9 17l-5-5"></path></svg></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="svelte-ieftj0"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path></svg></div>`);
		}

		$$renderer.push(`<!--]--></button></code></div>`);
	});
}