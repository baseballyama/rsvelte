import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { Button } from '$lib/components/ui/button';

export default function Category_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { categories = [] } = $$props;

		function navigateToCategory(slug, link) {
			if (link) {
				goto(`${link}`);
			} else if (slug) {
				goto(`/${slug}`);
			} else {
				goto('/products');
			}
		}

		$$renderer.push(`<div class="flex gap-4 overflow-x-auto py-2 sm:hidden"><!--[-->`);

		const each_array = $.ensure_array_like(categories.filter((category) => category.parentCategoryId === null));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { slug, icon, color, name, link, thumbnail } = each_array[$$index];

			Button($$renderer, {
				variant: 'plain',
				onclick: () => navigateToCategory(slug, link),
				class: 'flex flex-col items-center gap-2',
				children: ($$renderer) => {
					LazyImg($$renderer, {
						src: thumbnail,
						alt: `Shop ${$.stringify(name)} category`,
						class: 'overflow-hidden truncate rounded-full',
						width: '72',
						height: '72'
					});

					$$renderer.push(`<!----> <span class="h-4 w-24 text-xs text-gray-600">${$.escape(name)}</span>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);
	});
}