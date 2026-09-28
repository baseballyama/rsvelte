import * as $ from 'svelte/internal/server';
import { base } from "$app/paths";
import ChevronLeft from "@lucide/svelte/icons/chevron-left";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

export default function DocsPageNavigation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { prevPage, nextPage } = $$props;

		function getHref(slug) {
			return `${base}/docs/${slug}`;
		}

		$$renderer.push(`<nav class="border-border mt-16 border-t pt-8"><div class="grid grid-cols-2 gap-4">`);

		if (prevPage) {
			$$renderer.push(`<!--[0--><a${$.attr('href', getHref(prevPage.slug))} class="text-foreground hover:bg-accent flex items-center justify-start gap-3 rounded p-4 no-underline transition-all duration-200">`);
			ChevronLeft($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----> <div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs tracking-wide uppercase">Previous</span> <span class="text-[0.9375rem] font-medium">${$.escape(prevPage.title)}</span></div></a>`);
		} else {
			$$renderer.push(`<!--[-1--><div></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (nextPage) {
			$$renderer.push(`<!--[0--><a${$.attr('href', getHref(nextPage.slug))} class="text-foreground hover:bg-accent flex items-center justify-end gap-3 rounded p-4 text-right no-underline transition-all duration-200"><div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs tracking-wide uppercase">Next</span> <span class="text-[0.9375rem] font-medium">${$.escape(nextPage.title)}</span></div> `);
			ChevronRight($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push(`<!--[-1--><div></div>`);
		}

		$$renderer.push(`<!--]--></div></nav>`);
	});
}