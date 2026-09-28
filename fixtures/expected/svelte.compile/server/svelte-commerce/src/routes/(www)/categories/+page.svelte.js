import * as $ from 'svelte/internal/server';
import Canonical from '$lib/components/seo/canonical.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';
import { ChevronRight } from '@lucide/svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$.head('rsplks', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Categories</title>`);
			});
		});

		$$renderer.push(`<div class="container max-w-6xl px-4 py-4 md:py-10"><h1 class="mb-6 text-xl font-medium md:text-2xl">Shop by Category</h1> <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"><!--[-->`);

		const each_array = $.ensure_array_like(data.categories);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let category = each_array[$$index_1];

			$$renderer.push(`<a${$.attr('href', `/${$.stringify(category.slug)}`)} class="group flex flex-col overflow-hidden rounded-lg border bg-white transition-all hover:border-primary hover:shadow-lg"><div class="relative aspect-square overflow-hidden bg-muted">`);

			if (category.img) {
				$$renderer.push(`<!--[0--><img${$.attr('src', category.img)}${$.attr('alt', category.name)} loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
				EmptyImage($$renderer, { class: 'h-full w-full' });
			}

			$$renderer.push(`<!--]--></div> <div class="flex flex-1 flex-col p-3"><h3 class="font-medium">${$.escape(category.name)}</h3> <div class="mt-1 space-y-0.5"><!--[-->`);

			const each_array_1 = $.ensure_array_like(category.children.slice(0, 2));

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let child = each_array_1[$$index];

				$$renderer.push(`<div class="text-xs text-gray-600">${$.escape(child.name)}</div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (category.children.length > 2) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-0.5 text-xs text-primary"><span>View All</span> `);
				ChevronRight($$renderer, { class: 'h-3 w-3' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></a>`);
		}

		$$renderer.push(`<!--]--></div></div> `);
		Canonical($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}