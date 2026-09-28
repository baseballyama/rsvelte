import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import OrderListSkeleton from '../_OrderListSkeleton.svelte';
import BackButton from '$lib/components/common/back-button.svelte';
import StatusCell from '$lib/components/common/status-cell.svelte';

import {
	FileText,
	Truck,
	Calendar,
	CreditCard,
	Home,
	Building,
	ShoppingBag,
	Tag,
	Currency,
	RefreshCw,
	ChevronRight,
	Package,
	MapPin,
	CreditCardIcon,
	ReceiptText
} from '@lucide/svelte';

import { page } from '$app/state';
import { date, formatPrice } from '$lib/core/utils';
import { MyOrdersIdRenderer } from '$lib/core/composables/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'data']);
var root = $.from_html(`<!> Download Invoice`, 1);
var root_1 = $.from_html(`<span class="h-1 w-1 self-center rounded-full bg-gray-300"></span> <span> </span>`, 1);
var root_2 = $.from_html(`<p class="mt-1 text-sm text-muted-foreground line-through"> </p>`);
var root_3 = $.from_html(`<!> `, 1);
var root_4 = $.from_html(`<div class="flex gap-2"></div>`);
var root_5 = $.from_html(`<div class="p-3 sm:p-6 transition-colors hover:bg-gray-50/30"><div class="flex gap-6"><a class="relative  shrink-0 overflow-hidden"><!></a> <div class="flex flex-1 flex-col"><div class="flex flex-col justify-between gap-1 sm:flex-row sm:items-start sm:gap-4"><div class="flex-1"><a class="group"><h4 class="text-base font-semibold text-gray-900 transition-colors"> </h4></a> <div class="mt-2 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-gray-400"><span class="flex items-center gap-1.5"><!> </span> <!> <!></div></div> <div class="mt-2 sm:mt-0 sm:text-right"><p class="text-base font-semibold  text-gray-900"> </p> <!></div></div> <div class="mt-auto pt-4 flex items-center justify-between"><div class="flex flex-wrap gap-2"><!></div> <!></div></div></div></div>`);
var root_6 = $.from_html(`<div class="h-12 w-10 shrink-0 overflow-hidden rounded border border-gray-100"><!></div>`);
var root_7 = $.from_html(`<!> Track Shipment`, 1);
var root_8 = $.from_html(`<div class="p-6"><div class="flex flex-col gap-6 sm:flex-row sm:items-center"><div class="flex-1"><div class="flex items-center gap-3"><span class="text-sm font-bold text-gray-900"></span> <!></div> <div class="mt-4 flex flex-wrap gap-2"></div></div> <!></div></div>`);
var root_9 = $.from_html(`<div class="overflow-hidden rounded-xl border border-muted/20 bg-background shadow-sm"><div class="border-b border-gray-100 bg-gray-50/50 px-3 sm:px-6 py-4"><h3 class="font-bold text-gray-900">Shipments</h3></div> <div class="divide-y divide-gray-100"></div></div>`);
var root_10 = $.from_html(`<p> </p>`);
var root_11 = $.from_html(`<p class="mt-2 font-medium text-gray-900"> </p>`);
var root_12 = $.from_html(`<div class="pt-0"><div class="flex items-center gap-2 mb-3"><!> <h4 class="text-sm font-bold text-gray-900 uppercase tracking-tight">Billing Address</h4></div> <div class="text-sm leading-relaxed text-gray-600"><p class="font-bold text-gray-900"> </p> <p> </p> <p> </p></div></div>`);
var root_13 = $.from_html(`<div class="flex justify-between text-sm text-green-600"><span>Discount</span> <span> </span></div>`);
var root_14 = $.from_html(`<div class="flex justify-between text-xs font-bold text-primary"><span> </span> <span>Applied</span></div>`);
var root_15 = $.from_html(`<div class="flex justify-between text-sm"><span class="text-gray-500">COD Charges</span> <span class="font-medium text-gray-900"> </span></div>`);
var root_16 = $.from_html(`<!> Exchange or Return`, 1);
var root_17 = $.from_html(`<!> Back to All Orders`, 1);
var root_18 = $.from_html(`<section class="space-y-5 lg:pt-8"><div class="flex items-center gap-4"><!></div> <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl"> </h1> <p class="mt-2 text-sm text-gray-500">Placed on <span class="font-medium text-gray-900"> </span></p></div> <div class="flex items-center gap-3"><!></div></div> <div class="grid grid-cols-1 gap-8 lg:grid-cols-3"><div class="lg:col-span-2 space-y-6"><div class="rounded-md border border-muted/20 bg-muted/5 p-6"><div class="flex flex-col sm:flex-row items-center sm:items-start gap-6"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-muted/20 shadow-sm"><!></div> <div class="flex-1"><div class="flex items-center gap-4"><h3 class="text-base font-bold text-gray-900">Order Status</h3> <!></div> <p class="mt-2 text-sm text-gray-500"> </p> <div class="mt-4 flex w-fit items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-green-700 ring-1 ring-green-600/10"><!> <span class="font-medium">Estimated Arrival:</span> <span class="font-bold uppercase tracking-tight"> </span></div></div></div></div> <div class="overflow-hidden rounded-xl border border-muted/20 bg-background shadow-sm"><div class="px-3 sm:px-6 py-4"><h3 class="font-medium text-gray-900"> </h3></div> <div class="divide-y divide-gray-100"></div></div> <!></div> <div class="space-y-6"><div class="rounded-md border border-muted/20 bg-background shadow-sm overflow-hidden"><div class="bg-muted/20 px-6 py-3"><h3 class="font-semibold text-gray-900">Address Details</h3></div> <div class="p-3 sm:p-6 space-y-8"><div><div class="flex items-center gap-2 mb-3"><!> <h4 class="text-sm font-bold text-gray-900 uppercase tracking-tight">Shipping Address</h4></div> <div class="text-sm leading-relaxed text-gray-600"><p class="font-bold text-gray-900"> </p> <p> </p> <!> <p> </p> <p> </p> <!></div></div> <!></div></div> <div class="rounded-md border border-muted/20 bg-background shadow-sm overflow-hidden"><div class=" bg-muted/20 px-3 sm:px-6 py-4"><h3 class="font-semibold text-gray-900">Payment Summary</h3></div> <div class="p-6"><div class="space-y-2"><div class="flex justify-between text-sm"><span class="text-gray-500">Subtotal</span> <span class="font-medium text-gray-900"> </span></div> <!> <!> <div class="flex justify-between text-sm"><span class="text-gray-500">Shipping</span> <span class="font-medium text-gray-900"> </span></div> <!> <div class="pt-1 flex justify-between items-baseline"><span class="text-base font-bold text-gray-900">Total</span> <span class="text-base font-bold text-gray-900"> </span></div> <div class="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between gap-2"><div class="flex items-center gap-2"><!> <span class="text-xs font-bold uppercase tracking-tight text-gray-400">Payment Status</span></div> <span> </span></div></div></div></div> <!></div></div> <div class="pt-10 flex justify-center lg:hidden"><!></div></section>`);
var root_19 = $.from_html(`<div class="flex h-[70vh] flex-col items-center justify-center text-center"><div class="h-20 w-20 flex items-center justify-center rounded-full bg-muted/10 mb-6"><!></div> <h2 class="text-2xl font-bold text-gray-900">Order not found</h2> <p class="mt-2 text-gray-500">We couldn't find the order details you're looking for.</p> <!></div>`);
var root_20 = $.from_html(`<div><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let klass = $.prop($$props, 'class', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

	$.head('1kyfgrd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Order Details | Svelte Commerce';
		});
	});

	{
		const content = ($$anchor, $$arg0) => {
			let loading = () => ($$arg0?.()).loading;
			let order = () => ($$arg0?.()).order;
			var div = root_20();
			var node = $.child(div);

			{
				var consequent = ($$anchor) => {
					OrderListSkeleton($$anchor, {});
				};

				var consequent_16 = ($$anchor) => {
					var section = root_18();
					var div_1 = $.child(section);
					var node_1 = $.child(div_1);

					BackButton(node_1, { to: '/my/orders', title: 'Order History' });
					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var div_3 = $.child(div_2);
					var h1 = $.child(div_3);
					var text = $.only_child(h1);
					var p = $.sibling(h1, 2);
					var span = $.sibling($.child(p));
					var text_1 = $.only_child(span, true);

					$.reset(p);
					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var node_2 = $.child(div_4);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => order()?.invoiceLink);

								Button($$anchor, {
									variant: 'outline',
									get href() {
										return $.get($0);
									},
									target: '_blank',
									class: 'h-11 gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										FileText(node_3, { class: 'h-4 w-4' });
										$.next();
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							}
						};

						$.if(node_2, ($$render) => {
							if (order()?.invoiceLink) $$render(consequent_1);
						});
					}

					$.reset(div_4);
					$.reset(div_2);

					var div_5 = $.sibling(div_2, 2);
					var div_6 = $.child(div_5);
					var div_7 = $.child(div_6);
					var div_8 = $.child(div_7);
					var div_9 = $.child(div_8);
					var node_4 = $.child(div_9);

					Package(node_4, { class: 'h-6 w-6 text-primary' });
					$.reset(div_9);

					var div_10 = $.sibling(div_9, 2);
					var div_11 = $.child(div_10);
					var node_5 = $.sibling($.child(div_11), 2);

					{
						let $0 = $.derived(() => order()?.status || 'processing');

						StatusCell(node_5, {
							get value() {
								return $.get($0);
							}
						});
					}

					$.reset(div_11);

					var p_1 = $.sibling(div_11, 2);
					var text_2 = $.only_child(p_1);
					var div_12 = $.sibling(p_1, 2);
					var node_6 = $.child(div_12);

					Truck(node_6, { class: 'h-4 w-4' });

					var span_1 = $.sibling(node_6, 4);
					var text_3 = $.only_child(span_1, true);

					$.reset(div_12);
					$.reset(div_10);
					$.reset(div_8);
					$.reset(div_7);

					var div_13 = $.sibling(div_7, 2);
					var div_14 = $.child(div_13);
					var h3 = $.child(div_14);
					var text_4 = $.only_child(h3);

					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);

					$.each(div_15, 21, () => order()?.lineItems || [], $.index, ($$anchor, item) => {
						var div_16 = root_5();
						var div_17 = $.child(div_16);
						var a = $.child(div_17);
						var node_7 = $.child(a);

						{
							let $0 = $.derived(() => $.get(item).isCustomized
								? $.get(item).customizedImg
								: $.get(item).thumbnail || $.get(item).img);

							LazyImg(node_7, {
								get src() {
									return $.get($0);
								},

								get alt() {
									return $.get(item).title;
								},
								class: 'aspect-[3/4] w-24 object-contain sm:w-24'
							});
						}

						$.reset(a);

						var div_18 = $.sibling(a, 2);
						var div_19 = $.child(div_18);
						var div_20 = $.child(div_19);
						var a_1 = $.child(div_20);
						var h4 = $.child(a_1);
						var text_5 = $.only_child(h4, true);

						$.reset(a_1);

						var div_21 = $.sibling(a_1, 2);
						var span_2 = $.child(div_21);
						var node_8 = $.child(span_2);

						Tag(node_8, { class: 'h-3.5 w-3.5' });

						var text_6 = $.sibling(node_8);

						$.reset(span_2);

						var node_9 = $.sibling(span_2, 2);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_4 = root_1();
								var span_3 = $.sibling($.first_child(fragment_4), 2);
								var text_7 = $.only_child(span_3);

								$.template_effect(() => $.set_text(text_7, `Size: ${$.get(item).size ?? ''}`));
								$.append($$anchor, fragment_4);
							};

							$.if(node_9, ($$render) => {
								if ($.get(item).size) $$render(consequent_2);
							});
						}

						var node_10 = $.sibling(node_9, 2);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_5 = root_1();
								var span_4 = $.sibling($.first_child(fragment_5), 2);
								var text_8 = $.only_child(span_4, true);

								$.template_effect(() => $.set_text(text_8, $.get(item).variantTitle));
								$.append($$anchor, fragment_5);
							};

							$.if(node_10, ($$render) => {
								if ($.get(item).variantTitle) $$render(consequent_3);
							});
						}

						$.reset(div_21);
						$.reset(div_20);

						var div_22 = $.sibling(div_20, 2);
						var p_2 = $.child(div_22);
						var text_9 = $.only_child(p_2, true);
						var node_11 = $.sibling(p_2, 2);

						{
							var consequent_4 = ($$anchor) => {
								var p_3 = root_2();
								var text_10 = $.only_child(p_3, true);

								$.template_effect(($0) => $.set_text(text_10, $0), [
									() => formatPrice($.get(item).mrp * $.get(item).qty, page?.data?.store?.currency?.code)
								]);

								$.append($$anchor, p_3);
							};

							$.if(node_11, ($$render) => {
								if ($.get(item)?.mrp > $.get(item)?.price) $$render(consequent_4);
							});
						}

						$.reset(div_22);
						$.reset(div_19);

						var div_23 = $.sibling(div_19, 2);
						var div_24 = $.child(div_23);
						var node_12 = $.child(div_24);

						{
							var consequent_5 = ($$anchor) => {
								{
									let $0 = $.derived(() => $.get(item)?.slug);

									Button($$anchor, {
										variant: 'ghost',
										size: 'sm',
										get href() {
											return `/products/${$.get($0) ?? ''}#review`;
										},
										class: 'h-8 gap-2 text-xs font-bold',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('Rate & Review');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});
								}
							};

							$.if(node_12, ($$render) => {
								if ($.get(item)?.status === 'delivered') $$render(consequent_5);
							});
						}

						$.reset(div_24);

						var node_13 = $.sibling(div_24, 2);

						{
							var consequent_6 = ($$anchor) => {
								var div_25 = root_4();

								$.each(div_25, 21, () => $.get(item).files, $.index, ($$anchor, file, fx) => {
									Button($$anchor, {
										variant: 'outline',
										size: 'sm',
										get href() {
											return $.get(file);
										},
										download: true,
										class: 'h-8 gap-2 text-xs',
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root_3();
											var node_14 = $.first_child(fragment_8);

											FileText(node_14, { class: 'h-3.5 w-3.5' });

											var text_12 = $.sibling(node_14);

											text_12.nodeValue = ` File ${fx + 1}`;
											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div_25);
								$.append($$anchor, div_25);
							};

							$.if(node_13, ($$render) => {
								if ($.get(item)?.files?.length) $$render(consequent_6);
							});
						}

						$.reset(div_23);
						$.reset(div_18);
						$.reset(div_17);
						$.reset(div_16);

						$.template_effect(
							($0) => {
								$.set_attribute(a, 'href', `/products/${$.get(item).slug ?? ''}`);
								$.set_attribute(a_1, 'href', `/products/${$.get(item).slug ?? ''}`);
								$.set_text(text_5, $.get(item).title);
								$.set_text(text_6, ` Qty: ${$.get(item).qty ?? ''}`);
								$.set_text(text_9, $0);
							},
							[
								() => formatPrice($.get(item).price * $.get(item).qty, page?.data?.store?.currency?.code)
							]
						);

						$.append($$anchor, div_16);
					});

					$.reset(div_15);
					$.reset(div_13);

					var node_15 = $.sibling(div_13, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_26 = root_9();
							var div_27 = $.sibling($.child(div_26), 2);

							$.each(div_27, 21, () => order().fulfillments, $.index, ($$anchor, fulfillment, ix) => {
								var div_28 = root_8();
								var div_29 = $.child(div_28);
								var div_30 = $.child(div_29);
								var div_31 = $.child(div_30);
								var span_5 = $.child(div_31);

								span_5.textContent = `Shipment ${ix + 1}`;

								var node_16 = $.sibling(span_5, 2);

								{
									let $0 = $.derived(() => $.get(fulfillment)?.status);

									StatusCell(node_16, {
										get value() {
											return $.get($0);
										}
									});
								}

								$.reset(div_31);

								var div_32 = $.sibling(div_31, 2);

								$.each(div_32, 21, () => $.get(fulfillment)?.lineItems || [], $.index, ($$anchor, item) => {
									var div_33 = root_6();
									var node_17 = $.child(div_33);

									{
										let $0 = $.derived(() => $.get(item).thumbnail || $.get(item).img);

										LazyImg(node_17, {
											get src() {
												return $.get($0);
											},

											get alt() {
												return $.get(item).title;
											},
											class: 'h-full w-full object-cover'
										});
									}

									$.reset(div_33);
									$.append($$anchor, div_33);
								});

								$.reset(div_32);
								$.reset(div_30);

								var node_18 = $.sibling(div_30, 2);

								{
									var consequent_7 = ($$anchor) => {
										Button($$anchor, {
											variant: 'outline',
											get href() {
												return $.get(fulfillment).trackingUrl;
											},
											target: '_blank',
											class: 'h-10 gap-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_7();
												var node_19 = $.first_child(fragment_10);

												Truck(node_19, { class: 'h-4 w-4' });
												$.next();
												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_18, ($$render) => {
										if ($.get(fulfillment)?.trackingUrl) $$render(consequent_7);
									});
								}

								$.reset(div_29);
								$.reset(div_28);
								$.append($$anchor, div_28);
							});

							$.reset(div_27);
							$.reset(div_26);
							$.append($$anchor, div_26);
						};

						$.if(node_15, ($$render) => {
							if (order().fulfillments?.length) $$render(consequent_8);
						});
					}

					$.reset(div_6);

					var div_34 = $.sibling(div_6, 2);
					var div_35 = $.child(div_34);
					var div_36 = $.sibling($.child(div_35), 2);
					var div_37 = $.child(div_36);
					var div_38 = $.child(div_37);
					var node_20 = $.child(div_38);

					MapPin(node_20, { class: 'h-4 w-4 text-gray-400' });
					$.next(2);
					$.reset(div_38);

					var div_39 = $.sibling(div_38, 2);
					var p_4 = $.child(div_39);
					var text_13 = $.only_child(p_4);
					var p_5 = $.sibling(p_4, 2);
					var text_14 = $.only_child(p_5, true);
					var node_21 = $.sibling(p_5, 2);

					{
						var consequent_9 = ($$anchor) => {
							var p_6 = root_10();
							var text_15 = $.only_child(p_6, true);

							$.template_effect(() => $.set_text(text_15, order()?.shippingAddress?.address_2));
							$.append($$anchor, p_6);
						};

						$.if(node_21, ($$render) => {
							if (order()?.shippingAddress?.address_2) $$render(consequent_9);
						});
					}

					var p_7 = $.sibling(node_21, 2);
					var text_16 = $.only_child(p_7);
					var p_8 = $.sibling(p_7, 2);
					var text_17 = $.only_child(p_8);
					var node_22 = $.sibling(p_8, 2);

					{
						var consequent_10 = ($$anchor) => {
							var p_9 = root_11();
							var text_18 = $.only_child(p_9, true);

							$.template_effect(() => $.set_text(text_18, order()?.shippingAddress?.phone));
							$.append($$anchor, p_9);
						};

						$.if(node_22, ($$render) => {
							if (order()?.shippingAddress?.phone) $$render(consequent_10);
						});
					}

					$.reset(div_39);
					$.reset(div_37);

					var node_23 = $.sibling(div_37, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_40 = root_12();
							var div_41 = $.child(div_40);
							var node_24 = $.child(div_41);

							ReceiptText(node_24, { class: 'h-4 w-4 text-gray-400' });
							$.next(2);
							$.reset(div_41);

							var div_42 = $.sibling(div_41, 2);
							var p_10 = $.child(div_42);
							var text_19 = $.only_child(p_10);
							var p_11 = $.sibling(p_10, 2);
							var text_20 = $.only_child(p_11, true);
							var p_12 = $.sibling(p_11, 2);
							var text_21 = $.only_child(p_12);

							$.reset(div_42);
							$.reset(div_40);

							$.template_effect(() => {
								$.set_text(text_19, `${order()?.billingAddress?.firstName ?? ''} ${order()?.billingAddress?.lastName ?? ''}`);
								$.set_text(text_20, order()?.billingAddress?.address_1);
								$.set_text(text_21, `${order()?.billingAddress?.city ?? ''}, ${order()?.billingAddress?.state ?? ''} - ${order()?.billingAddress?.zip ?? ''}`);
							});

							$.append($$anchor, div_40);
						};

						$.if(node_23, ($$render) => {
							if (order()?.billingAddress) $$render(consequent_11);
						});
					}

					$.reset(div_36);
					$.reset(div_35);

					var div_43 = $.sibling(div_35, 2);
					var div_44 = $.sibling($.child(div_43), 2);
					var div_45 = $.child(div_44);
					var div_46 = $.child(div_45);
					var span_6 = $.sibling($.child(div_46), 2);
					var text_22 = $.only_child(span_6, true);

					$.reset(div_46);

					var node_25 = $.sibling(div_46, 2);

					{
						var consequent_12 = ($$anchor) => {
							var div_47 = root_13();
							var span_7 = $.sibling($.child(div_47), 2);
							var text_23 = $.only_child(span_7);

							$.reset(div_47);

							$.template_effect(($0) => $.set_text(text_23, `-${$0 ?? ''}`), [
								() => formatPrice(order()?.discount, page?.data?.store?.currency?.code)
							]);

							$.append($$anchor, div_47);
						};

						$.if(node_25, ($$render) => {
							if (order()?.discount > 0) $$render(consequent_12);
						});
					}

					var node_26 = $.sibling(node_25, 2);

					{
						var consequent_13 = ($$anchor) => {
							var div_48 = root_14();
							var span_8 = $.child(div_48);
							var text_24 = $.only_child(span_8);

							$.next(2);
							$.reset(div_48);
							$.template_effect(() => $.set_text(text_24, `Coupon (${order().coupon.code ?? ''})`));
							$.append($$anchor, div_48);
						};

						$.if(node_26, ($$render) => {
							if (order()?.coupon?.code) $$render(consequent_13);
						});
					}

					var div_49 = $.sibling(node_26, 2);
					var span_9 = $.sibling($.child(div_49), 2);
					var text_25 = $.only_child(span_9, true);

					$.reset(div_49);

					var node_27 = $.sibling(div_49, 2);

					{
						var consequent_14 = ($$anchor) => {
							var div_50 = root_15();
							var span_10 = $.sibling($.child(div_50), 2);
							var text_26 = $.only_child(span_10, true);

							$.reset(div_50);

							$.template_effect(($0) => $.set_text(text_26, $0), [
								() => formatPrice(order().codCharges, page?.data?.store?.currency?.code)
							]);

							$.append($$anchor, div_50);
						};

						$.if(node_27, ($$render) => {
							if (order()?.codCharges) $$render(consequent_14);
						});
					}

					var div_51 = $.sibling(node_27, 2);
					var span_11 = $.sibling($.child(div_51), 2);
					var text_27 = $.only_child(span_11, true);

					$.reset(div_51);

					var div_52 = $.sibling(div_51, 2);
					var div_53 = $.child(div_52);
					var node_28 = $.child(div_53);

					CreditCardIcon(node_28, { class: 'h-4 w-4 text-gray-400' });
					$.next(2);
					$.reset(div_53);

					var span_12 = $.sibling(div_53, 2);
					var text_28 = $.only_child(span_12, true);

					$.reset(div_52);
					$.reset(div_45);
					$.reset(div_44);
					$.reset(div_43);

					var node_29 = $.sibling(div_43, 2);

					{
						var consequent_15 = ($$anchor) => {
							{
								let $0 = $.derived(() => order()?.orderId);
								let $1 = $.derived(() => order()?.itemId);

								Button($$anchor, {
									variant: 'secondary',
									get href() {
										return `/my/exchange?orderId=${$.get($0) ?? ''}&itemId=${$.get($1) ?? ''}`;
									},
									class: 'w-full h-12 gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_16();
										var node_30 = $.first_child(fragment_12);

										RefreshCw(node_30, { class: 'h-4 w-4' });
										$.next();
										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							}
						};

						var d = $.derived(() => order()?.replaceValidTill != null && new Date().getTime() <= order()?.replaceValidTill && !order()?.isReplaceOrReturn);

						$.if(node_29, ($$render) => {
							if ($.get(d)) $$render(consequent_15);
						});
					}

					$.reset(div_34);
					$.reset(div_5);

					var div_54 = $.sibling(div_5, 2);
					var node_31 = $.child(div_54);

					Button(node_31, {
						variant: 'ghost',
						href: '/my/orders',
						class: 'gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_17();
							var node_32 = $.first_child(fragment_13);

							ChevronRight(node_32, { class: 'h-4 w-4 rotate-180' });
							$.next();
							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});

					$.reset(div_54);
					$.reset(section);

					$.template_effect(
						($0, $1, $2, $3, $4) => {
							$.set_text(text, `Order #${order()?.orderNo ?? ''}`);
							$.set_text(text_1, $0);
							$.set_text(text_2, `Your order is currently ${(order()?.status || 'being processed') ?? ''}.`);
							$.set_text(text_3, $1);
							$.set_text(text_4, `Order Items (${(order()?.lineItems?.length || 0) ?? ''})`);
							$.set_text(text_13, `${order()?.shippingAddress?.firstName ?? ''} ${order()?.shippingAddress?.lastName ?? ''}`);
							$.set_text(text_14, order()?.shippingAddress?.address_1);
							$.set_text(text_16, `${order()?.shippingAddress?.city ?? ''}, ${order()?.shippingAddress?.state ?? ''}`);
							$.set_text(text_17, `${(order()?.shippingAddress?.country || order()?.shippingAddress?.countryCode) ?? ''} - ${order()?.shippingAddress?.zip ?? ''}`);
							$.set_text(text_22, $2);
							$.set_text(text_25, $3);
							$.set_text(text_27, $4);
							$.set_class(span_12, 1, `text-xs font-bold uppercase tracking-wider ${order()?.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'}`);
							$.set_text(text_28, order()?.paymentStatus);
						},
						[
							() => date(order()?.createdAt),
							() => order()?.shippingRate?.estimatedMaxDays
								? date(order().createdAt + order()?.shippingRate?.estimatedMaxDays * 86400000)
								: date(new Date(Date.now() + 7 * 86400000).toISOString()),
							() => formatPrice(order()?.subtotal, page?.data?.store?.currency?.code),
							() => order()?.shippingCharges > 0
								? formatPrice(order().shippingCharges, page?.data?.store?.currency?.code)
								: 'FREE',
							() => formatPrice(order()?.total, page?.data?.store?.currency?.code)
						]
					);

					$.append($$anchor, section);
				};

				var alternate = ($$anchor) => {
					var div_55 = root_19();
					var div_56 = $.child(div_55);
					var node_33 = $.child(div_56);

					ShoppingBag(node_33, { class: 'h-10 w-10 text-muted-foreground/50' });
					$.reset(div_56);

					var node_34 = $.sibling(div_56, 6);

					Button(node_34, {
						href: '/my/orders',
						class: 'mt-8 h-12 px-8',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_29 = $.text('View All Orders');

							$.append($$anchor, text_29);
						},
						$$slots: { default: true }
					});

					$.reset(div_55);
					$.append($$anchor, div_55);
				};

				$.if(node, ($$render) => {
					if (loading()) $$render(consequent); else if (order()) $$render(consequent_16, 1); else $$render(alternate, -1);
				});
			}

			$.reset(div);
			$.template_effect(() => $.set_class(div, 1, `mx-auto max-w-6xl ${klass() ?? ''}`));
			$.append($$anchor, div);
		};

		MyOrdersIdRenderer($$anchor, { content, $$slots: { content: true } });
	}

	$.pop();
}