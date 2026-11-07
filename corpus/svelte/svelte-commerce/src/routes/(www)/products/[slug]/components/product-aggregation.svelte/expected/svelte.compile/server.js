import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { sortByNumericValue } from '$lib/core/utils/index.js';

export default function Product_aggregation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();

		if (page.data?.product?.ag && Object.keys(page.data?.product?.ag).length) {
			$$renderer.push(`<!--[0--><div class="intra-gap flex flex-col edp-aggregation"><!--[-->`);

			const each_array = $.ensure_array_like(Object.entries(page.data?.product?.ag || {}));

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let [optionName, values] = each_array[$$index_1];

				if (Array.isArray(values)) {
					$$renderer.push(`<!--[0--><div class="flex flex-col gap-3"><div class="flex items-center gap-2"><span class="text-sm font-semibold text-gray-900 dark:text-gray-100 edp-opt-label">${$.escape(optionName)} `);

					if (productState.selectedAggregations?.[optionName]) {
						$$renderer.push(`<!--[0-->:`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span> <span class="font-semibold edp-opt-value">${$.escape(productState.selectedAggregations?.[optionName] || '')}</span></div> <div class="flex flex-wrap items-center gap-3"><!--[-->`);

					const each_array_1 = $.ensure_array_like(sortByNumericValue(values));

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let value = each_array_1[$$index];

						Button($$renderer, {
							variant: productState.selectedAggregations?.[optionName] === value ? 'default' : 'plain',
							disabled: !productState.isAggregationAvaliable(optionName, value),
							class: `edp-pill min-w-[3.5rem] !bg-primary px-4 py-2 ${productState.selectedAggregations?.[optionName] === value
								? 'edp-on border !border-accent !bg-transparent'
								: '!bg-accent text-accent-foreground'}`,
							onclick: () => productState.toggleAggregation(optionName, value, true),
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(value)}`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}