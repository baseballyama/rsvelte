import * as $ from 'svelte/internal/server';
import { ChevronRight, Home } from '@lucide/svelte';

export default function Breadcrumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { categoryHierarchy } = $$props;

		// Categories with a blank name or slug render as an empty, dead breadcrumb link, and
		// reach the BreadcrumbList schema as positions with no name.
		const crumbs = $.derived(() => (categoryHierarchy || []).filter((c) => String(c?.name ?? '').trim() && String(c?.slug ?? '').trim()));

		if (// let items = $state([])
		// let isProductsPage = $derived(page.route?.id === '/(www)/products/[slug]')
		categoryHierarchy && categoryHierarchy.length > 0) {
			$$renderer.push(`<!--[0--><nav class="flex overflow-x-auto scrollbar-none whitespace-nowrap sm:py-1 svelte-1vm5avy" aria-label="Breadcrumb"><div class="inline-flex items-center space-x-1 text-sm md:space-x-2"><div class="inline-flex flex-shrink-0 items-center"><a href="/" class="inline-flex items-center text-muted-foreground hover:text-foreground">`);
			Home($$renderer, { class: 'mr-2 h-4 w-4 max-sm:hidden flex-shrink-0' });
			$$renderer.push(`<!----> Home</a></div> <ol class="inline-flex items-center space-x-1 md:space-x-2"><!--[-->`);

			const each_array = $.ensure_array_like(crumbs());

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let { slug, name } = each_array[i];

				$$renderer.push(`<li class="flex-shrink-0"><div class="flex items-center">`);

				ChevronRight($$renderer, {
					class: 'h-4 min-h-4 w-4 min-w-4 text-muted-foreground flex-shrink-0'
				});

				$$renderer.push(`<!----> <div class="grid grid-cols-1"><a${$.attr('href', `/${$.stringify(slug)}`)}${$.attr_class(`block text-muted-foreground hover:text-foreground md:ml-2 ${i === categoryHierarchy.length - 1
					? 'truncate max-w-[calc(100vw-9rem)] sm:max-w-[500px] lg:max-w-[760px] xl:max-w-[980px] 2xl:max-w-[1180px]'
					: ''}`)}${$.attr('title', name)}>${$.escape(name)}</a></div></div></li>`);
			}

			$$renderer.push(`<!--]--></ol></div></nav>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}