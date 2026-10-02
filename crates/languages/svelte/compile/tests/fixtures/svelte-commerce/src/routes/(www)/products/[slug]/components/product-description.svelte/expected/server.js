import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';
import { ChevronDown, ChevronUp } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';

export default function Product_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();
		const data = $.derived(() => page.data);
		const description = $.derived(() => productState.selectedVariant?.description || data()?.product?.description || '');
		const hasDescription = $.derived(() => description().replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim().length > 0);
		let isOpen = true;

		if (hasDescription()) {
			$$renderer.push(`<!--[0--><div class="border-b border-gray-300 edp-acc"><button class="intra-pt flex w-full items-center justify-between gap-2 pb-2 text-base font-bold text-gray-900 edp-acc-btn"><span class="edp-acc-label">Product Description</span> `);

			if (isOpen) {
				$$renderer.push('<!--[0-->');
				ChevronUp($$renderer, { class: 'h-4 w-4 text-gray-800' });
			} else {
				$$renderer.push('<!--[-1-->');
				ChevronDown($$renderer, { class: 'h-4 w-4 text-gray-800' });
			}

			$$renderer.push(`<!--]--></button> `);

			if (isOpen) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-1 overflow-x-auto pb-6"><div class="edp-prose prose prose-sm max-w-none leading-relaxed text-gray-600 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-li:list-disc [&amp;>table]:w-full [&amp;>table]:border-collapse [&amp;_td]:border-b [&amp;_td]:border-gray-50 [&amp;_td]:py-3 [&amp;_td]:text-sm [&amp;_th]:border-b [&amp;_th]:border-gray-100 [&amp;_th]:py-3 [&amp;_th]:text-left [&amp;_th]:text-xs [&amp;_th]:font-bold [&amp;_th]:uppercase [&amp;_th]:tracking-widest">${$.html(description())}</div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}