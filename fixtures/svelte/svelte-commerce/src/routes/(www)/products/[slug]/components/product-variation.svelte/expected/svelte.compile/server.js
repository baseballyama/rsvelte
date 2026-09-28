import * as $ from 'svelte/internal/server';
import { useProductState } from '$lib/core/composables/index.js';
import { ChartNoAxesGanttIcon } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import SizeGuideDrawer from './size-guide-drawer.svelte';

export default function Product_variation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();

		$$renderer.push(`<div class="intra-gap flex flex-col edp-variation"><!---->`);

		{
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(productState.productOptions || []);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let option = each_array[$$index_1];

				$$renderer.push(`<div class="flex flex-col gap-3"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-sm font-semibold text-gray-900 dark:text-gray-100 edp-opt-label">${$.escape(option.title)} `);

				if (productState.selectedVariant?.options?.find((opt) => option.id === opt.optionId)?.value) {
					$$renderer.push(`<!--[0-->:`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span> <span class="font-semibold edp-opt-value">${$.escape(productState.selectedVariant?.options?.find((opt) => option.id === opt.optionId)?.value)}</span></div> `);

				if (option.type === 'Size') {
					$$renderer.push('<!--[0-->');
					SizeGuideDrawer($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="flex flex-wrap items-center gap-3" role="group"${$.attr('aria-label', option.title)}><!--[-->`);

				const each_array_1 = $.ensure_array_like(option.values || []);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let v = each_array_1[$$index];

					if (option.type === 'Color') {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'outline',
							size: 'icon',
							'aria-pressed': productState.isVariantOptionSelected(option.id, v.value),
							class: `edp-swatch group relative h-10 w-10 rounded-full p-0.5 ${productState.isVariantOptionSelected(option.id, v.value) ? 'edp-on ring-2 ring-primary ring-offset-2' : ''} ${!v?.selectable ? 'opacity-40' : ''}`,
							onclick: () => productState.selectVariant({ option, value: v }),
							title: v.value,
							children: ($$renderer) => {
								$$renderer.push(`<div class="h-full w-full rounded-full"${$.attr_style(`background-color: ${$.stringify(v.value)}`)}></div> <span class="sr-only">${$.escape(v.value)}</span>`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Button($$renderer, {
							variant: productState.isVariantOptionSelected(option.id, v.value) ? 'default' : 'plain',
							'aria-pressed': productState.isVariantOptionSelected(option.id, v.value),
							disabled: !v?.selectable,
							class: `edp-pill min-w-[3.5rem] !bg-primary px-4 py-2 ${productState.isVariantOptionSelected(option.id, v.value)
								? 'edp-on border !border-accent !bg-transparent'
								: '!bg-accent text-accent-foreground'}`,
							onclick: () => productState.selectVariant({ option, value: v }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(v.value)}`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!----></div>`);
	});
}