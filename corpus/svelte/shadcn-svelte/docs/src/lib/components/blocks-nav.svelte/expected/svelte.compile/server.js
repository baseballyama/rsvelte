import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { registryCategories } from "$lib/registry/registry-categories.js";
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";

function BlocksNavLink($$renderer, { category, isActive }) {
	if (!category.hidden) {
		$$renderer.push(`<!--[0--><a${$.attr('href', `/blocks/${$.stringify(category.slug)}`)} class="flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary"${$.attr('data-active', isActive)}>${$.escape(category.name)}</a>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}

export default function Blocks_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="relative overflow-hidden">`);

		ScrollArea($$renderer, {
			class: 'max-w-none',
			orientation: 'both',
			scrollbarXClasses: 'invisible',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center">`);

				BlocksNavLink($$renderer, {
					category: { name: "Featured", slug: "", hidden: false },
					isActive: page.url.pathname === "/blocks"
				});

				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(registryCategories);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let category = each_array[$$index];

					BlocksNavLink($$renderer, {
						category,
						isActive: page.url.pathname === `/blocks/${category.slug}`
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}