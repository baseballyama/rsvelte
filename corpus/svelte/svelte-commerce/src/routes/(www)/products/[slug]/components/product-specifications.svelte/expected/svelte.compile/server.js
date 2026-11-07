import * as $ from 'svelte/internal/server';
import { useProductState } from '$lib/core/composables/index.js';
import { getSettingState } from '$lib/core/stores/index.js';
import QrCodeDisplayer from '$lib/core/components/common/qr-code.svelte';
import { page } from '$app/state';
import { ChevronDown, ChevronUp } from '@lucide/svelte';

export default function Product_specifications($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();
		const settingState = getSettingState();
		const data = $.derived(() => page.data);
		let isOpen = true;

		$$renderer.push(`<div class="edp-spec"><button class="flex w-full items-center justify-between gap-2 text-semibold font-bold pb-2 text-gray-900 intra-pt"><span class="edp-acc-label">Product Specifications</span> `);

		if (isOpen) {
			$$renderer.push('<!--[0-->');
			ChevronUp($$renderer, { class: 'h-4 w-4 text-gray-800' });
		} else {
			$$renderer.push('<!--[-1-->');
			ChevronDown($$renderer, { class: 'h-4 w-4 text-gray-800' });
		}

		$$renderer.push(`<!--]--></button> `);

		if (isOpen) {
			$$renderer.push(`<!--[0--><div class="grid grid-cols-2 gap-y-4">`);

			if (productState.selectedVariant?.sku || data()?.product?.sku) {
				$$renderer.push(`<!--[0--><div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">SKU</p> <p class="break-words break-all text-sm font-medium text-gray-600">${$.escape(String(productState.selectedVariant?.sku || data()?.product?.sku))}</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (productState.selectedVariant?.barcode || data()?.product?.barcode) {
				$$renderer.push(`<!--[0--><div class="flex flex-col gap-1 text-left"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Barcode</p> <p class="text-sm font-medium text-gray-900">${$.escape(productState.selectedVariant?.barcode || data()?.product?.barcode)}</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (productState.selectedVariant?.width || data()?.product?.width || productState.selectedVariant?.height || data()?.product?.height || productState.selectedVariant?.length || data()?.product?.length) {
				$$renderer.push(`<!--[0--><div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Dimensions</p> <p class="text-sm font-medium text-gray-900">`);

				if (productState.selectedVariant?.width || data()?.product?.width) {
					$$renderer.push(`<!--[0-->W-${$.escape(productState.selectedVariant?.width || data()?.product?.width)}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if ((productState.selectedVariant?.width || data()?.product?.width) && (productState.selectedVariant?.height || data()?.product?.height)) {
					$$renderer.push(`<!--[0-->x`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (productState.selectedVariant?.height || data()?.product?.height) {
					$$renderer.push(`<!--[0-->H-${$.escape(productState.selectedVariant?.height || data()?.product?.height)}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if ((productState.selectedVariant?.height || data()?.product?.height || productState.selectedVariant?.width || data()?.product?.width) && (productState.selectedVariant?.length || data()?.product?.length)) {
					$$renderer.push(`<!--[0-->x`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (productState.selectedVariant?.length || data()?.product?.length) {
					$$renderer.push(`<!--[0-->L-${$.escape(productState.selectedVariant?.length || data()?.product?.length)}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (productState.selectedVariant?.weight || data()?.product?.weight) {
				$$renderer.push(`<!--[0--><div class="flex flex-col gap-1 text-right"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Weight</p> <p class="text-sm font-medium text-gray-900">${$.escape(productState.selectedVariant?.weight || data()?.product?.weight)}
							${$.escape(page?.data?.store.weight_unit || settingState?.selectedStore?.weight_unit)}</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (data()?.product?.originCountry) {
				$$renderer.push(`<!--[0--><div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Origin</p> <p class="text-sm font-medium text-gray-900">${$.escape(data()?.product?.originCountry)}</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array = $.ensure_array_like(data()?.product?.attributes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { name, value } = each_array[$$index];

				$$renderer.push(`<div class="grid grid-cols-1 gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0"><div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">${$.escape(name.replaceAll('_', ' '))}</p> <p class="text-sm font-medium text-gray-900">${$.escape(value)}</p></div></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (productState.selectedVariant?.qrcode || data()?.product?.qrcode) {
				$$renderer.push(`<!--[0--><div class="mt-4 flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4 edp-spec-qr"><p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Authenticity</p> `);

				QrCodeDisplayer($$renderer, {
					base64Data: productState.selectedVariant?.qrcode || data()?.product?.qrcode
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}