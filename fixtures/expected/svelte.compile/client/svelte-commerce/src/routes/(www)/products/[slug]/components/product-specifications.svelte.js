import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useProductState } from '$lib/core/composables/index.js';
import { getSettingState } from '$lib/core/stores/index.js';
import QrCodeDisplayer from '$lib/core/components/common/qr-code.svelte';
import { page } from '$app/state';
import { ChevronDown, ChevronUp } from '@lucide/svelte';

var root = $.from_html(`<div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">SKU</p> <p class="break-words break-all text-sm font-medium text-gray-600"> </p></div>`);
var root_1 = $.from_html(`<div class="flex flex-col gap-1 text-left"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Barcode</p> <p class="text-sm font-medium text-gray-900"> </p></div>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Dimensions</p> <p class="text-sm font-medium text-gray-900"><!> <!> <!> <!> <!></p></div>`);
var root_3 = $.from_html(`<div class="flex flex-col gap-1 text-right"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Weight</p> <p class="text-sm font-medium text-gray-900"> </p></div>`);
var root_4 = $.from_html(`<div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Origin</p> <p class="text-sm font-medium text-gray-900"> </p></div>`);
var root_5 = $.from_html(`<div class="grid grid-cols-1 gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0"><div class="flex flex-col gap-1"><p class="text-[10px] font-bold uppercase tracking-tighter text-gray-400"> </p> <p class="text-sm font-medium text-gray-900"> </p></div></div>`);
var root_6 = $.from_html(`<div class="mt-4 flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4 edp-spec-qr"><p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Authenticity</p> <!></div>`);
var root_7 = $.from_html(`<div class="grid grid-cols-2 gap-y-4"><!> <!> <!> <!> <!> <!> <!></div>`);
var root_8 = $.from_html(`<div class="edp-spec"><button class="flex w-full items-center justify-between gap-2 text-semibold font-bold pb-2 text-gray-900 intra-pt"><span class="edp-acc-label">Product Specifications</span> <!></button> <!></div>`);

export default function Product_specifications($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	const settingState = getSettingState();
	const data = $.derived(() => page.data);
	let isOpen = $.state(true);
	var div = root_8();
	var button = $.child(div);
	var node = $.sibling($.child(button), 2);

	{
		var consequent = ($$anchor) => {
			ChevronUp($$anchor, { class: 'h-4 w-4 text-gray-800' });
		};

		var alternate = ($$anchor) => {
			ChevronDown($$anchor, { class: 'h-4 w-4 text-gray-800' });
		};

		$.if(node, ($$render) => {
			if ($.get(isOpen)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		var consequent_12 = ($$anchor) => {
			var div_1 = root_7();
			var node_2 = $.child(div_1);

			{
				var consequent_1 = ($$anchor) => {
					var div_2 = root();
					var p = $.sibling($.child(div_2), 2);
					var text = $.only_child(p, true);

					$.reset(div_2);

					$.template_effect(($0) => $.set_text(text, $0), [
						() => String(productState.selectedVariant?.sku || $.get(data)?.product?.sku)
					]);

					$.append($$anchor, div_2);
				};

				$.if(node_2, ($$render) => {
					if (productState.selectedVariant?.sku || $.get(data)?.product?.sku) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_3 = root_1();
					var p_1 = $.sibling($.child(div_3), 2);
					var text_1 = $.only_child(p_1, true);

					$.reset(div_3);
					$.template_effect(() => $.set_text(text_1, productState.selectedVariant?.barcode || $.get(data)?.product?.barcode));
					$.append($$anchor, div_3);
				};

				$.if(node_3, ($$render) => {
					if (productState.selectedVariant?.barcode || $.get(data)?.product?.barcode) $$render(consequent_2);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_4 = root_2();
					var p_2 = $.sibling($.child(div_4), 2);
					var node_5 = $.child(p_2);

					{
						var consequent_3 = ($$anchor) => {
							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, `W-${(productState.selectedVariant?.width || $.get(data)?.product?.width) ?? ''}`));
							$.append($$anchor, text_2);
						};

						$.if(node_5, ($$render) => {
							if (productState.selectedVariant?.width || $.get(data)?.product?.width) $$render(consequent_3);
						});
					}

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent_4 = ($$anchor) => {
							var text_3 = $.text('x');

							$.append($$anchor, text_3);
						};

						$.if(node_6, ($$render) => {
							if ((productState.selectedVariant?.width || $.get(data)?.product?.width) && (productState.selectedVariant?.height || $.get(data)?.product?.height)) $$render(consequent_4);
						});
					}

					var node_7 = $.sibling(node_6, 2);

					{
						var consequent_5 = ($$anchor) => {
							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, `H-${(productState.selectedVariant?.height || $.get(data)?.product?.height) ?? ''}`));
							$.append($$anchor, text_4);
						};

						$.if(node_7, ($$render) => {
							if (productState.selectedVariant?.height || $.get(data)?.product?.height) $$render(consequent_5);
						});
					}

					var node_8 = $.sibling(node_7, 2);

					{
						var consequent_6 = ($$anchor) => {
							var text_5 = $.text('x');

							$.append($$anchor, text_5);
						};

						$.if(node_8, ($$render) => {
							if ((productState.selectedVariant?.height || $.get(data)?.product?.height || productState.selectedVariant?.width || $.get(data)?.product?.width) && (productState.selectedVariant?.length || $.get(data)?.product?.length)) $$render(consequent_6);
						});
					}

					var node_9 = $.sibling(node_8, 2);

					{
						var consequent_7 = ($$anchor) => {
							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, `L-${(productState.selectedVariant?.length || $.get(data)?.product?.length) ?? ''}`));
							$.append($$anchor, text_6);
						};

						$.if(node_9, ($$render) => {
							if (productState.selectedVariant?.length || $.get(data)?.product?.length) $$render(consequent_7);
						});
					}

					$.reset(p_2);
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_4, ($$render) => {
					if (productState.selectedVariant?.width || $.get(data)?.product?.width || productState.selectedVariant?.height || $.get(data)?.product?.height || productState.selectedVariant?.length || $.get(data)?.product?.length) $$render(consequent_8);
				});
			}

			var node_10 = $.sibling(node_4, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_5 = root_3();
					var p_3 = $.sibling($.child(div_5), 2);
					var text_7 = $.only_child(p_3);

					$.reset(div_5);

					$.template_effect(() => $.set_text(text_7, `${(productState.selectedVariant?.weight || $.get(data)?.product?.weight) ?? ''}
							${(page?.data?.store.weight_unit || settingState?.selectedStore?.weight_unit) ?? ''}`));

					$.append($$anchor, div_5);
				};

				$.if(node_10, ($$render) => {
					if (productState.selectedVariant?.weight || $.get(data)?.product?.weight) $$render(consequent_9);
				});
			}

			var node_11 = $.sibling(node_10, 2);

			{
				var consequent_10 = ($$anchor) => {
					var div_6 = root_4();
					var p_4 = $.sibling($.child(div_6), 2);
					var text_8 = $.only_child(p_4, true);

					$.reset(div_6);
					$.template_effect(() => $.set_text(text_8, $.get(data)?.product?.originCountry));
					$.append($$anchor, div_6);
				};

				$.if(node_11, ($$render) => {
					if ($.get(data)?.product?.originCountry) $$render(consequent_10);
				});
			}

			var node_12 = $.sibling(node_11, 2);

			$.each(node_12, 17, () => $.get(data)?.product?.attributes, $.index, ($$anchor, $$item) => {
				let name = () => $.get($$item).name;
				let value = () => $.get($$item).value;
				var div_7 = root_5();
				var div_8 = $.child(div_7);
				var p_5 = $.child(div_8);
				var text_9 = $.only_child(p_5, true);
				var p_6 = $.sibling(p_5, 2);
				var text_10 = $.only_child(p_6, true);

				$.reset(div_8);
				$.reset(div_7);

				$.template_effect(
					($0) => {
						$.set_text(text_9, $0);
						$.set_text(text_10, value());
					},
					[() => name().replaceAll('_', ' ')]
				);

				$.append($$anchor, div_7);
			});

			var node_13 = $.sibling(node_12, 2);

			{
				var consequent_11 = ($$anchor) => {
					var div_9 = root_6();
					var node_14 = $.sibling($.child(div_9), 2);

					{
						let $0 = $.derived(() => productState.selectedVariant?.qrcode || $.get(data)?.product?.qrcode);

						QrCodeDisplayer(node_14, {
							get base64Data() {
								return $.get($0);
							}
						});
					}

					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				$.if(node_13, ($$render) => {
					if (productState.selectedVariant?.qrcode || $.get(data)?.product?.qrcode) $$render(consequent_11);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isOpen)) $$render(consequent_12);
		});
	}

	$.reset(div);
	$.delegated('click', button, () => $.set(isOpen, !$.get(isOpen)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);