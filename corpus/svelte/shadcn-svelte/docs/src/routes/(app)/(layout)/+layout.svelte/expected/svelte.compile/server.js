import * as $ from 'svelte/internal/server';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import SiteFooter from "$lib/components/site-footer.svelte";
import SiteHeader from "$lib/components/site-header.svelte";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="relative z-10 flex min-h-svh flex-col bg-background">`);
	SiteHeader($$renderer, {});
	$$renderer.push(`<!----> <main class="flex flex-1 flex-col">`);

	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</main> `);
	SiteFooter($$renderer, {});
	$$renderer.push(`<!----></div>`);
}