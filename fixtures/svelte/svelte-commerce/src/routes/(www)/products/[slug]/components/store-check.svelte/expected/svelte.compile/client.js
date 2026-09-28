import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sheet from '$lib/components/ui/sheet/index.js';
import { useProductState } from '$lib/core/composables/index.js';
import { AlertTriangle, Check, Clock, Home, MapPin, StoreIcon } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button/index.js';

var root = $.from_html(`<span class="flex w-fit items-center gap-1 self-start rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600"><!> <span class="whitespace-nowrap">In Stock</span></span>`);
var root_1 = $.from_html(`<span class="flex w-fit items-center gap-1 self-start rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"><!> <span class="whitespace-nowrap">Out of Stock</span></span>`);
var root_2 = $.from_html(`<div class="flex items-center justify-between p-6 py-4"><div class="flex w-full flex-col gap-2"><div class="flex w-full items-center justify-between gap-2"><h3 class="text-lg font-semibold text-gray-900"> </h3> <!></div> <div class="flex flex-col gap-1 text-sm"><div class="flex items-center gap-1 text-gray-500"><!> <span class="text-gray-700"> </span></div> <div class="flex items-center gap-1 pl-4 text-gray-500"><span> </span></div></div> <div class="mt-1 flex items-center gap-1 text-sm text-gray-500"><!> <span>Lead Time: <span class="font-medium text-gray-700"> </span></span></div></div></div>`);
var root_3 = $.from_html(`<!> <div class="mt-5 flex flex-col divide-y border-y"></div>`, 1);
var root_4 = $.from_html(`<div class="my-5 flex flex-col gap-2 edp-store"><div class="flex items-center gap-2"><!> <span class="font-semibold edp-store-title">Looking to pickup this item?</span></div> <span class="text-sm text-gray-500 edp-store-text">You can pick up this item from our store. Please check the availability of this item at your nearest store.</span> <!></div> <!>`, 1);

export default function Store_check($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Sheet.Root, ($$anchor, Sheet_Root) => {
				Sheet_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var div = $.first_child(fragment_2);
						var div_1 = $.child(div);
						var node_2 = $.child(div_1);

						StoreIcon(node_2, { class: 'h-5 w-5' });
						$.next(2);
						$.reset(div_1);

						var node_3 = $.sibling(div_1, 4);

						$.component(node_3, () => Sheet.Trigger, ($$anchor, Sheet_Trigger) => {
							Sheet_Trigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'link',
										class: 'self-start h-auto p-0',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Check Availability');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.reset(div);

						var node_4 = $.sibling(div, 2);

						$.component(node_4, () => Sheet.Content, ($$anchor, Sheet_Content) => {
							Sheet_Content($$anchor, {
								class: 'p-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_3();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Sheet.Header, ($$anchor, Sheet_Header) => {
										Sheet_Header($$anchor, {
											class: 'p-6 pb-0',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Sheet.Title, ($$anchor, Sheet_Title) => {
													Sheet_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Availability at Stores');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var div_2 = $.sibling(node_5, 2);

									$.each(div_2, 21, () => productState.warehouses, $.index, ($$anchor, house) => {
										var div_3 = root_2();
										var div_4 = $.child(div_3);
										var div_5 = $.child(div_4);
										var h3 = $.child(div_5);
										var text_2 = $.only_child(h3, true);
										var node_7 = $.sibling(h3, 2);

										{
											var consequent = ($$anchor) => {
												var span = root();
												var node_8 = $.child(span);

												Check(node_8, { size: 12 });
												$.next(2);
												$.reset(span);
												$.append($$anchor, span);
											};

											var d = $.derived(() => Number($.get(house).stock) > 0);

											var alternate = ($$anchor) => {
												var span_1 = root_1();
												var node_9 = $.child(span_1);

												AlertTriangle(node_9, { size: 12 });
												$.next(2);
												$.reset(span_1);
												$.append($$anchor, span_1);
											};

											$.if(node_7, ($$render) => {
												if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.reset(div_5);

										var div_6 = $.sibling(div_5, 2);
										var div_7 = $.child(div_6);
										var node_10 = $.child(div_7);

										MapPin(node_10, { size: 12 });

										var span_2 = $.sibling(node_10, 2);
										var text_3 = $.only_child(span_2);

										$.reset(div_7);

										var div_8 = $.sibling(div_7, 2);
										var span_3 = $.child(div_8);
										var text_4 = $.only_child(span_3);

										$.reset(div_8);
										$.reset(div_6);

										var div_9 = $.sibling(div_6, 2);
										var node_11 = $.child(div_9);

										Clock(node_11, { size: 12 });

										var span_4 = $.sibling(node_11, 2);
										var span_5 = $.sibling($.child(span_4));
										var text_5 = $.only_child(span_5);

										$.reset(span_4);
										$.reset(div_9);
										$.reset(div_4);
										$.reset(div_3);

										$.template_effect(() => {
											$.set_text(text_2, $.get(house).name);
											$.set_text(text_3, `${$.get(house).address_1 ?? ''}${$.get(house).address_2 ? `, ${$.get(house).address_2}` : ''}`);
											$.set_text(text_4, `${$.get(house).city ?? ''}, ${$.get(house).state ?? ''} ${$.get(house).zip ?? ''}`);
											$.set_text(text_5, `${$.get(house).leadTime ?? ''} hours`);
										});

										$.append($$anchor, div_3);
									});

									$.reset(div_2);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (productState.wareHousePluginEnabled && productState.warehouses?.length > 0) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}