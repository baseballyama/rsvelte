import * as $ from 'svelte/internal/server';
import * as Sheet from '$lib/components/ui/sheet/index.js';
import { useProductState } from '$lib/core/composables/index.js';
import { AlertTriangle, Check, Clock, Home, MapPin, StoreIcon } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button/index.js';

export default function Store_check($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();

		if (productState.wareHousePluginEnabled && productState.warehouses?.length > 0) {
			$$renderer.push('<!--[0-->');

			if (Sheet.Root) {
				$$renderer.push('<!--[-->');

				Sheet.Root($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="my-5 flex flex-col gap-2 edp-store"><div class="flex items-center gap-2">`);
						StoreIcon($$renderer, { class: 'h-5 w-5' });
						$$renderer.push(`<!----> <span class="font-semibold edp-store-title">Looking to pickup this item?</span></div> <span class="text-sm text-gray-500 edp-store-text">You can pick up this item from our store. Please check the availability of this item at your nearest store.</span> `);

						if (Sheet.Trigger) {
							$$renderer.push('<!--[-->');

							Sheet.Trigger($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										variant: 'link',
										class: 'self-start h-auto p-0',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Check Availability`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> `);

						if (Sheet.Content) {
							$$renderer.push('<!--[-->');

							Sheet.Content($$renderer, {
								class: 'p-0',
								children: ($$renderer) => {
									if (Sheet.Header) {
										$$renderer.push('<!--[-->');

										Sheet.Header($$renderer, {
											class: 'p-6 pb-0',
											children: ($$renderer) => {
												if (Sheet.Title) {
													$$renderer.push('<!--[-->');

													Sheet.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Availability at Stores`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="mt-5 flex flex-col divide-y border-y"><!--[-->`);

									const each_array = $.ensure_array_like(productState.warehouses);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let house = each_array[$$index];

										$$renderer.push(`<div class="flex items-center justify-between p-6 py-4"><div class="flex w-full flex-col gap-2"><div class="flex w-full items-center justify-between gap-2"><h3 class="text-lg font-semibold text-gray-900">${$.escape(house.name)}</h3> `);

										if (Number(house.stock) > 0) {
											$$renderer.push(`<!--[0--><span class="flex w-fit items-center gap-1 self-start rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">`);
											Check($$renderer, { size: 12 });
											$$renderer.push(`<!----> <span class="whitespace-nowrap">In Stock</span></span>`);
										} else {
											$$renderer.push(`<!--[-1--><span class="flex w-fit items-center gap-1 self-start rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">`);
											AlertTriangle($$renderer, { size: 12 });
											$$renderer.push(`<!----> <span class="whitespace-nowrap">Out of Stock</span></span>`);
										}

										$$renderer.push(`<!--]--></div> <div class="flex flex-col gap-1 text-sm"><div class="flex items-center gap-1 text-gray-500">`);
										MapPin($$renderer, { size: 12 });
										$$renderer.push(`<!----> <span class="text-gray-700">${$.escape(house.address_1)}${$.escape(house.address_2 ? `, ${house.address_2}` : '')}</span></div> <div class="flex items-center gap-1 pl-4 text-gray-500"><span>${$.escape(house.city)}, ${$.escape(house.state)} ${$.escape(house.zip)}</span></div></div> <div class="mt-1 flex items-center gap-1 text-sm text-gray-500">`);
										Clock($$renderer, { size: 12 });
										$$renderer.push(`<!----> <span>Lead Time: <span class="font-medium text-gray-700">${$.escape(house.leadTime)} hours</span></span></div></div></div>`);
									}

									$$renderer.push(`<!--]--></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}