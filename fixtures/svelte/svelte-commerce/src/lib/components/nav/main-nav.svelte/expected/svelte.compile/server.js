import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Home } from '@lucide/svelte';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';

export default function Main_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="mr-4 md:flex"><div class="flex gap-3">`);

		if (page?.data?.store?.logo) {
			$$renderer.push(`<!--[0--><a href="/"><img${$.attr('src', getImageCDNUrl(page?.data?.store?.logo, 300, 0))} class="h-10 object-contain"${$.attr('alt', `${$.stringify(page?.data?.store?.name || 'Store')} logo`)}/></a>`);
		} else {
			$$renderer.push(`<!--[-1--><a href="/" class="flex items-center space-x-2"><span class="font-bold">${$.escape(page?.data?.store?.name || '')}</span></a>`);
		}

		$$renderer.push(`<!--]--> `);

		if (!page?.data?.store?.plugins?.megamenu?.active) {
			$$renderer.push(`<!--[0--><div class="ml-6 hidden items-center space-x-6 lg:flex"><!--[-->`);

			const each_array = $.ensure_array_like(page?.data?.store?.menu?.find?.((menu) => menu?.menuId === 'header')?.items || []);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<a${$.attr('href', item.link)} class="ed-nav-link relative text-sm font-bold uppercase tracking-widest text-gray-500 transition-all after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-gray-900 hover:after:w-full active:scale-95" style="font-family: var(--font-body);">${$.escape(item?.name)}</a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}