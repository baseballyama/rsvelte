import * as $ from 'svelte/internal/server';
import { useProductState } from '$lib/core/composables/index.js';
import { Badge } from '$lib/components/ui/badge';
import { page } from '$app/state';

export default function Product_tags($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();
		const data = $.derived(() => page.data);

		if (data()?.product?.productTags?.length > 0) {
			$$renderer.push(`<!--[0--><div class="flex flex-wrap gap-2 edp-tags"><!--[-->`);

			const each_array = $.ensure_array_like((data()?.product.productTags || '').split(',') || []);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let t = each_array[$$index];

				Badge($$renderer, {
					variant: 'outline',
					class: 'edp-tag',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(t)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}