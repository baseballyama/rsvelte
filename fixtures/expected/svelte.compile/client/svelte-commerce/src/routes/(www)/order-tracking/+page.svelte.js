import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import productNonVeg from '$lib/assets/product/non-veg.png';
import productVeg from '$lib/assets/product/veg.png';
import { date, formatPrice } from '$lib/core/utils';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import OrderListSkeleton from '../../(my)/my/orders/_OrderListSkeleton.svelte';
import OrderTimeline from '$lib/components/order/order-timeline.svelte';
import StatusCell from '$lib/components/common/status-cell.svelte';
import { OrderTrackingModule } from '$lib/core/composables/index.js';
import { CheckCircle } from '@lucide/svelte';

var root = $.from_html(`<div class="flex items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<img class="h-auto w-14 object-contain object-top"/>`);
var root_2 = $.from_html(`<img alt="veg" class="h-5 w-5"/>`);
var root_3 = $.from_html(`<img alt="non veg" class="h-5 w-5"/>`);
var root_4 = $.from_html(`<div><!></div>`);
var root_5 = $.from_html(`<span>Qty : <b> </b></span>`);
var root_6 = $.from_html(`<span>Size : <b> </b></span>`);
var root_7 = $.from_html(`<b> </b> <!>`, 1);
var root_8 = $.from_html(`<ul class="flex flex-wrap items-center gap-x-2 gap-y-1"></ul>`);
var root_9 = $.from_html(`<div class="flex flex-wrap gap-2"><span> </span> <!></div>`);
var root_10 = $.from_html(`<span class="text-secondary-500 whitespace-nowrap"> </span>`);
var root_11 = $.from_html(`<span class="whitespace-nowrap text-zinc-500 line-through"><strike> </strike></span> <!>`, 1);
var root_12 = $.from_html(`Download File <!>`, 1);
var root_13 = $.from_html(`<li><a download=""><!></a></li>`);
var root_14 = $.from_html(`<ul class="mt-2 flex list-none flex-col gap-1 p-0"></ul>`);
var root_15 = $.from_html(`<div class="mt-2 xl:mt-0 xl:w-1/3"><a aria-label="Click to visit rate &amp; review product" class="max-w-max whitespace-nowrap font-semibold text-indigo-500 hover:underline focus:outline-none">Rate & Review Product</a></div>`);
var root_16 = $.from_html(`<div class="flex gap-2 p-5 lg:gap-5"><a aria-label="Click to view the product details" class="shrink-0"><!></a> <div class="flex w-full flex-1 flex-col gap-0.5 xl:pr-4"><div class="flex justify-between gap-2 sm:gap-4"><a aria-label="Click to view the product details" class="flex-1 hover:underline"><p> </p></a> <!></div> <!> <!> <!> <div class="flex flex-wrap items-center gap-1">Item price : <span class="whitespace-nowrap font-bold text-zinc-800"> </span> <!></div> <div class="flex flex-wrap items-center gap-1">Sub Total : <span class="whitespace-nowrap font-bold text-zinc-800"> </span> <!></div> <!> <!></div></div>`);
var root_17 = $.from_html(`<div class="divide-y divide-dashed text-xs text-zinc-500"></div>`);
var root_18 = $.from_html(`<p>No order items found</p>`);
var root_19 = $.from_html(`<p class="text-sm"> </p>`);
var root_20 = $.from_html(`<div class="flex items-center gap-2 text-sm text-muted-foreground"><!> <span>Same as shipping address</span></div>`);
var root_21 = $.from_html(`<p class="flex flex-col text-sm"><span> <br/> <!> <br/> <span class="uppercase"> </span> </span></p> <!>`, 1);
var root_22 = $.from_html(`<p class="flex items-center"><span class="mr-2 w-32">Discount</span> <span> </span></p>`);
var root_23 = $.from_html(`<p class="flex items-center"><span class="mr-2 w-32">COD Charges</span> <span> </span></p>`);
var root_24 = $.from_html(`<section class="container mx-auto"><div class="my-5 overflow-hidden rounded-lg border sm:mb-10"><div class="flex flex-wrap items-center justify-between rounded-lg rounded-b-none border-b bg-gray-50 px-5 py-3"><div class="flex items-center gap-4"><h6> </h6> <!></div> <h6 class="mt-2 text-sm text-gray-500 sm:mt-0"> </h6></div> <div class="flex flex-col lg:grid lg:grid-cols-2 lg:divide-x"><div class="order-1 flex flex-col divide-y lg:order-none"><!></div> <div class="order-2 p-5 lg:order-none"><div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-5"><div class="space-y-2"><h5 class="font-semibold">Delivery Address</h5> <p class="flex flex-col text-sm"><span> <br/> <!> <br/> <span class="uppercase"> </span> </span></p> <!></div> <div class="space-y-2"><h5 class="font-semibold">Billing Address</h5> <!></div></div></div> <div class="order-3 col-span-full flex justify-end !border-0 !border-t border-gray-200 bg-gray-50 p-5"><div class="flex w-full max-w-md flex-col items-start gap-2"><p class="flex items-center"><span class="mr-2 w-32">Subtotal</span> <span> </span></p> <!> <p class="flex items-center"><span class="mr-2 w-32">Shipping</span> <span>: &nbsp; <!></span></p> <!> <hr class="w-full border-t border-zinc-200"/> <div class="flex items-center text-sm font-bold text-zinc-800"><span class="mr-2 w-32">Total</span> <span> </span></div></div></div></div></div> <!></section>`);
var root_25 = $.from_html(`<div class="flex h-[70vh] flex-col items-center justify-center text-center"><h2 class="mb-2 text-2xl font-semibold text-gray-800">Invalid Order Tracking URL</h2> <p class="mb-5 text-gray-600">The order tracking link appears to be invalid or has expired.</p> <a href="/" aria-label="Return to homepage" data-sveltekit-preload-data=""><!></a></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const orderTrackingModule = new OrderTrackingModule();
	var div = root_4();

	$.head('s2sv7m', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Order';
		});
	});

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			OrderListSkeleton(node_1, {});
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var consequent_31 = ($$anchor) => {
			var section = root_24();
			var div_2 = $.child(section);
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var h6 = $.child(div_4);
			var text = $.only_child(h6);
			var node_2 = $.sibling(h6, 2);

			{
				let $0 = $.derived(() => orderTrackingModule.order?.status);

				StatusCell(node_2, {
					get value() {
						return $.get($0);
					}
				});
			}

			$.reset(div_4);

			var h6_1 = $.sibling(div_4, 2);
			var text_1 = $.only_child(h6_1);

			$.reset(div_3);

			var div_5 = $.sibling(div_3, 2);
			var div_6 = $.child(div_5);
			var node_3 = $.child(div_6);

			{
				var consequent_20 = ($$anchor) => {
					var div_7 = root_17();

					$.each(div_7, 21, () => orderTrackingModule.order?.lineItems, $.index, ($$anchor, item) => {
						var fragment = $.comment();
						var node_4 = $.first_child(fragment);

						{
							var consequent_19 = ($$anchor) => {
								var div_8 = root_16();
								var a = $.child(div_8);
								var node_5 = $.child(a);

								{
									var consequent_1 = ($$anchor) => {
										var img = root_1();

										$.template_effect(() => {
											$.set_attribute(img, 'src', $.get(item).customizedImg);
											$.set_attribute(img, 'alt', `${$.get(item).name ?? ''} (Customized)`);
										});

										$.append($$anchor, img);
									};

									var alternate = ($$anchor) => {
										{
											let $0 = $.derived(() => $.get(item).thumbnail || $.get(item).img);

											LazyImg($$anchor, {
												get src() {
													return $.get($0);
												},

												get alt() {
													return $.get(item).name;
												},
												width: '56',
												class: 'h-auto w-14 object-contain object-top'
											});
										}
									};

									$.if(node_5, ($$render) => {
										if ($.get(item).isCustomized) $$render(consequent_1); else $$render(alternate, -1);
									});
								}

								$.reset(a);

								var div_9 = $.sibling(a, 2);
								var div_10 = $.child(div_9);
								var a_1 = $.child(div_10);
								var p = $.child(a_1);
								var text_2 = $.only_child(p, true);

								$.reset(a_1);

								var node_6 = $.sibling(a_1, 2);

								{
									var consequent_4 = ($$anchor) => {
										var div_11 = root_4();
										var node_7 = $.child(div_11);

										{
											var consequent_2 = ($$anchor) => {
												var img_1 = root_2();

												$.template_effect(() => $.set_attribute(img_1, 'src', productVeg));
												$.append($$anchor, img_1);
											};

											var consequent_3 = ($$anchor) => {
												var img_2 = root_3();

												$.template_effect(() => $.set_attribute(img_2, 'src', productNonVeg));
												$.append($$anchor, img_2);
											};

											$.if(node_7, ($$render) => {
												if ($.get(item).foodType === 'veg') $$render(consequent_2); else if ($.get(item).foodType === 'nonveg') $$render(consequent_3, 1);
											});
										}

										$.reset(div_11);
										$.append($$anchor, div_11);
									};

									$.if(node_6, ($$render) => {
										if (page.data.store?.isFnb && $.get(item).foodType) $$render(consequent_4);
									});
								}

								$.reset(div_10);

								var node_8 = $.sibling(div_10, 2);

								{
									var consequent_5 = ($$anchor) => {
										var span = root_5();
										var b = $.sibling($.child(span));
										var text_3 = $.only_child(b, true);

										$.reset(span);
										$.template_effect(() => $.set_text(text_3, $.get(item).qty));
										$.append($$anchor, span);
									};

									$.if(node_8, ($$render) => {
										if ($.get(item).qty) $$render(consequent_5);
									});
								}

								var node_9 = $.sibling(node_8, 2);

								{
									var consequent_6 = ($$anchor) => {
										var span_1 = root_6();
										var b_1 = $.sibling($.child(span_1));
										var text_4 = $.only_child(b_1, true);

										$.reset(span_1);
										$.template_effect(() => $.set_text(text_4, $.get(item).size));
										$.append($$anchor, span_1);
									};

									$.if(node_9, ($$render) => {
										if ($.get(item).size) $$render(consequent_6);
									});
								}

								var node_10 = $.sibling(node_9, 2);

								{
									var consequent_11 = ($$anchor) => {
										var fragment_2 = $.comment();
										var node_11 = $.first_child(fragment_2);

										$.each(node_11, 17, () => $.get(item)?.usedOptions, $.index, ($$anchor, option) => {
											var fragment_3 = $.comment();
											var node_12 = $.first_child(fragment_3);

											{
												var consequent_10 = ($$anchor) => {
													var div_12 = root_9();
													var span_2 = $.child(div_12);
													var text_5 = $.only_child(span_2);
													var node_13 = $.sibling(span_2, 2);

													{
														var consequent_9 = ($$anchor) => {
															var ul = root_8();

															$.each(ul, 21, () => $.get(option).val, $.index, ($$anchor, v, valIndex) => {
																var fragment_4 = $.comment();
																var node_14 = $.first_child(fragment_4);

																{
																	var consequent_8 = ($$anchor) => {
																		var fragment_5 = root_7();
																		var b_2 = $.first_child(fragment_5);
																		var text_6 = $.only_child(b_2, true);
																		var node_15 = $.sibling(b_2, 2);

																		{
																			var consequent_7 = ($$anchor) => {
																				var text_7 = $.text(',');

																				$.append($$anchor, text_7);
																			};

																			$.if(node_15, ($$render) => {
																				if (valIndex < $.get(option).val?.length - 1) $$render(consequent_7);
																			});
																		}

																		$.template_effect(() => $.set_text(text_6, $.get(v)));
																		$.append($$anchor, fragment_5);
																	};

																	$.if(node_14, ($$render) => {
																		if ($.get(v)) $$render(consequent_8);
																	});
																}

																$.append($$anchor, fragment_4);
															});

															$.reset(ul);
															$.append($$anchor, ul);
														};

														$.if(node_13, ($$render) => {
															if ($.get(option).val) $$render(consequent_9);
														});
													}

													$.reset(div_12);
													$.template_effect(() => $.set_text(text_5, `${$.get(option).name ?? ''}:`));
													$.append($$anchor, div_12);
												};

												$.if(node_12, ($$render) => {
													if ($.get(option)?.val?.length && $.get(option)?.val !== undefined && $.get(option)?.val != '') $$render(consequent_10);
												});
											}

											$.append($$anchor, fragment_3);
										});

										$.append($$anchor, fragment_2);
									};

									$.if(node_10, ($$render) => {
										if ($.get(item)?.usedOptions?.length) $$render(consequent_11);
									});
								}

								var div_13 = $.sibling(node_10, 2);
								var span_3 = $.sibling($.child(div_13));
								var text_8 = $.only_child(span_3, true);
								var node_16 = $.sibling(span_3, 2);

								{
									var consequent_13 = ($$anchor) => {
										var fragment_6 = root_11();
										var span_4 = $.first_child(fragment_6);
										var strike = $.child(span_4);
										var text_9 = $.only_child(strike, true);

										$.reset(span_4);

										var node_17 = $.sibling(span_4, 2);

										{
											var consequent_12 = ($$anchor) => {
												var span_5 = root_10();
												var text_10 = $.only_child(span_5);

												$.template_effect(($0) => $.set_text(text_10, `(${$0 ?? ''}% off)`), [
													() => Math.floor(($.get(item).mrp - $.get(item).price) / $.get(item).mrp * 100)
												]);

												$.append($$anchor, span_5);
											};

											var d = $.derived(() => Math.floor(($.get(item).mrp - $.get(item).price) / $.get(item).mrp * 100) > 0);

											$.if(node_17, ($$render) => {
												if ($.get(d)) $$render(consequent_12);
											});
										}

										$.template_effect(($0) => $.set_text(text_9, $0), [
											() => formatPrice($.get(item).mrp, page?.data?.store?.currency?.code)
										]);

										$.append($$anchor, fragment_6);
									};

									$.if(node_16, ($$render) => {
										if ($.get(item)?.mrp > $.get(item)?.price) $$render(consequent_13);
									});
								}

								$.reset(div_13);

								var div_14 = $.sibling(div_13, 2);
								var span_6 = $.sibling($.child(div_14));
								var text_11 = $.only_child(span_6, true);
								var node_18 = $.sibling(span_6, 2);

								{
									var consequent_15 = ($$anchor) => {
										var fragment_7 = root_11();
										var span_7 = $.first_child(fragment_7);
										var strike_1 = $.child(span_7);
										var text_12 = $.only_child(strike_1, true);

										$.reset(span_7);

										var node_19 = $.sibling(span_7, 2);

										{
											var consequent_14 = ($$anchor) => {
												var span_8 = root_10();
												var text_13 = $.only_child(span_8);

												$.template_effect(($0) => $.set_text(text_13, `(${$0 ?? ''}% off)`), [
													() => Math.floor(($.get(item).total - $.get(item).subtotal) / $.get(item).total * 100)
												]);

												$.append($$anchor, span_8);
											};

											var d_1 = $.derived(() => Math.floor(($.get(item).total - $.get(item).subtotal) / $.get(item).total * 100) > 0);

											$.if(node_19, ($$render) => {
												if ($.get(d_1)) $$render(consequent_14);
											});
										}

										$.template_effect(($0) => $.set_text(text_12, $0), [
											() => formatPrice($.get(item).total, page?.data?.store?.currency?.code)
										]);

										$.append($$anchor, fragment_7);
									};

									$.if(node_18, ($$render) => {
										if ($.get(item)?.total > $.get(item)?.subtotal) $$render(consequent_15);
									});
								}

								$.reset(div_14);

								var node_20 = $.sibling(div_14, 2);

								{
									var consequent_17 = ($$anchor) => {
										var ul_1 = root_14();

										$.each(ul_1, 21, () => $.get(item)?.files, $.index, ($$anchor, file, fx) => {
											var li = root_13();
											var a_2 = $.child(li);
											var node_21 = $.child(a_2);

											Button(node_21, {
												class: 'text-xs',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_8 = root_12();
													var node_22 = $.sibling($.first_child(fragment_8));

													{
														var consequent_16 = ($$anchor) => {
															var text_14 = $.text();

															text_14.nodeValue = fx + 1;
															$.append($$anchor, text_14);
														};

														$.if(node_22, ($$render) => {
															if ($.get(item)?.files?.length > 1) $$render(consequent_16);
														});
													}

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});

											$.reset(a_2);
											$.reset(li);
											$.template_effect(() => $.set_attribute(a_2, 'href', $.get(file)));
											$.append($$anchor, li);
										});

										$.reset(ul_1);
										$.append($$anchor, ul_1);
									};

									$.if(node_20, ($$render) => {
										if ($.get(item)?.files?.length) $$render(consequent_17);
									});
								}

								var node_23 = $.sibling(node_20, 2);

								{
									var consequent_18 = ($$anchor) => {
										var div_15 = root_15();
										var a_3 = $.only_child(div_15);

										$.template_effect(() => $.set_attribute(a_3, 'href', `/products/${$.get(item)?.slug ?? ''}#review`));
										$.append($$anchor, div_15);
									};

									$.if(node_23, ($$render) => {
										if ($.get(item)?.status === 'delivered') $$render(consequent_18);
									});
								}

								$.reset(div_9);
								$.reset(div_8);

								$.template_effect(
									($0, $1) => {
										$.set_attribute(a, 'href', `/products/${$.get(item).slug}`);
										$.set_attribute(a_1, 'href', `/products/${$.get(item).slug}`);
										$.set_text(text_2, $.get(item).name);
										$.set_text(text_8, $0);
										$.set_text(text_11, $1);
									},
									[
										() => formatPrice($.get(item).price, page?.data?.store?.currency?.code),
										() => formatPrice($.get(item).subtotal, page?.data?.store?.currency?.code)
									]
								);

								$.append($$anchor, div_8);
							};

							$.if(node_4, ($$render) => {
								if ($.get(item)) $$render(consequent_19);
							});
						}

						$.append($$anchor, fragment);
					});

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				var alternate_1 = ($$anchor) => {
					var p_1 = root_18();

					$.append($$anchor, p_1);
				};

				$.if(node_3, ($$render) => {
					if (orderTrackingModule.order?.lineItems) $$render(consequent_20); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_6);

			var div_16 = $.sibling(div_6, 2);
			var div_17 = $.child(div_16);
			var div_18 = $.child(div_17);
			var p_2 = $.sibling($.child(div_18), 2);
			var span_9 = $.child(p_2);
			var text_15 = $.child(span_9);
			var text_16 = $.sibling(text_15, 2);
			var node_24 = $.sibling(text_16);

			{
				var consequent_21 = ($$anchor) => {
					var text_17 = $.text();

					$.template_effect(() => $.set_text(text_17, `, ${orderTrackingModule.order?.shippingAddress?.address_2 ?? ''}`));
					$.append($$anchor, text_17);
				};

				$.if(node_24, ($$render) => {
					if (orderTrackingModule.order?.shippingAddress?.address_2) $$render(consequent_21);
				});
			}

			var text_18 = $.sibling(node_24);
			var text_19 = $.sibling(text_18, 2);
			var span_10 = $.sibling(text_19);
			var text_20 = $.only_child(span_10, true);
			var text_21 = $.sibling(span_10);

			$.reset(span_9);
			$.reset(p_2);

			var node_25 = $.sibling(p_2, 2);

			{
				var consequent_22 = ($$anchor) => {
					var p_3 = root_19();
					var text_22 = $.only_child(p_3, true);

					$.template_effect(() => $.set_text(text_22, orderTrackingModule.order?.shippingAddress?.phone));
					$.append($$anchor, p_3);
				};

				$.if(node_25, ($$render) => {
					if (orderTrackingModule.order?.shippingAddress?.phone) $$render(consequent_22);
				});
			}

			$.reset(div_18);

			var div_19 = $.sibling(div_18, 2);
			var node_26 = $.sibling($.child(div_19), 2);

			{
				var consequent_23 = ($$anchor) => {
					var div_20 = root_20();
					var node_27 = $.child(div_20);

					CheckCircle(node_27, { class: 'h-4 w-4 text-green-500' });
					$.next(2);
					$.reset(div_20);
					$.append($$anchor, div_20);
				};

				var consequent_26 = ($$anchor) => {
					var fragment_11 = root_21();
					var p_4 = $.first_child(fragment_11);
					var span_11 = $.child(p_4);
					var text_23 = $.child(span_11);
					var text_24 = $.sibling(text_23, 2);
					var node_28 = $.sibling(text_24);

					{
						var consequent_24 = ($$anchor) => {
							var text_25 = $.text();

							$.template_effect(() => $.set_text(text_25, `, ${orderTrackingModule.order?.billingAddress?.address_2 ?? ''}`));
							$.append($$anchor, text_25);
						};

						$.if(node_28, ($$render) => {
							if (orderTrackingModule.order?.billingAddress?.address_2) $$render(consequent_24);
						});
					}

					var text_26 = $.sibling(node_28);
					var text_27 = $.sibling(text_26, 2);
					var span_12 = $.sibling(text_27);
					var text_28 = $.only_child(span_12, true);
					var text_29 = $.sibling(span_12);

					$.reset(span_11);
					$.reset(p_4);

					var node_29 = $.sibling(p_4, 2);

					{
						var consequent_25 = ($$anchor) => {
							var p_5 = root_19();
							var text_30 = $.only_child(p_5, true);

							$.template_effect(() => $.set_text(text_30, orderTrackingModule.order?.billingAddress?.phone));
							$.append($$anchor, p_5);
						};

						$.if(node_29, ($$render) => {
							if (orderTrackingModule.order?.billingAddress?.phone) $$render(consequent_25);
						});
					}

					$.template_effect(() => {
						$.set_text(text_23, `${orderTrackingModule.order?.billingAddress?.firstName ?? ''}
											${orderTrackingModule.order?.billingAddress?.lastName ?? ''} `);

						$.set_text(text_24, ` ${orderTrackingModule.order?.billingAddress?.address_1 ?? ''} `);
						$.set_text(text_26, ` , ${orderTrackingModule.order?.billingAddress?.city ?? ''} `);
						$.set_text(text_27, ` ${orderTrackingModule.order?.billingAddress?.state ?? ''}, `);
						$.set_text(text_28, orderTrackingModule.order?.billingAddress?.country || orderTrackingModule.order?.billingAddress?.countryCode);

						$.set_text(text_29, `,
											${orderTrackingModule.order?.billingAddress?.zip ?? ''}`);
					});

					$.append($$anchor, fragment_11);
				};

				$.if(node_26, ($$render) => {
					if (orderTrackingModule.order?.billingAddressId === orderTrackingModule.order?.shippingAddressId) $$render(consequent_23); else if (orderTrackingModule.order?.billingAddress) $$render(consequent_26, 1);
				});
			}

			$.reset(div_19);
			$.reset(div_17);
			$.reset(div_16);

			var div_21 = $.sibling(div_16, 2);
			var div_22 = $.child(div_21);
			var p_6 = $.child(div_22);
			var span_13 = $.sibling($.child(p_6), 2);
			var text_31 = $.only_child(span_13);

			$.reset(p_6);

			var node_30 = $.sibling(p_6, 2);

			{
				var consequent_27 = ($$anchor) => {
					var p_7 = root_22();
					var span_14 = $.sibling($.child(p_7), 2);
					var text_32 = $.only_child(span_14);

					$.reset(p_7);

					$.template_effect(
						($0) => $.set_text(text_32, `:  

										${$0 ?? ''}`),
						[
							() => formatPrice(orderTrackingModule.order?.discount || 0, page?.data?.store?.currency?.code) || '0.00'
						]
					);

					$.append($$anchor, p_7);
				};

				$.if(node_30, ($$render) => {
					if (orderTrackingModule.order?.discount && orderTrackingModule.order?.discount > 0) $$render(consequent_27);
				});
			}

			var p_8 = $.sibling(node_30, 2);
			var span_15 = $.sibling($.child(p_8), 2);
			var node_31 = $.sibling($.child(span_15));

			{
				var consequent_28 = ($$anchor) => {
					var text_33 = $.text();

					$.template_effect(($0) => $.set_text(text_33, $0), [
						() => formatPrice(orderTrackingModule.order?.shippingCharges, page?.data?.store?.currency?.code)
					]);

					$.append($$anchor, text_33);
				};

				var alternate_2 = ($$anchor) => {
					var text_34 = $.text('Free');

					$.append($$anchor, text_34);
				};

				$.if(node_31, ($$render) => {
					if (orderTrackingModule.order?.shippingCharges) $$render(consequent_28); else $$render(alternate_2, -1);
				});
			}

			$.reset(span_15);
			$.reset(p_8);

			var node_32 = $.sibling(p_8, 2);

			{
				var consequent_29 = ($$anchor) => {
					var p_9 = root_23();
					var span_16 = $.sibling($.child(p_9), 2);
					var text_35 = $.only_child(span_16);

					$.reset(p_9);

					$.template_effect(
						($0) => $.set_text(text_35, `:  

										${$0 ?? ''}`),
						[
							() => formatPrice(orderTrackingModule.order?.codCharges, page?.data?.store?.currency?.code)
						]
					);

					$.append($$anchor, p_9);
				};

				$.if(node_32, ($$render) => {
					if (orderTrackingModule.order?.codCharges) $$render(consequent_29);
				});
			}

			var div_23 = $.sibling(node_32, 4);
			var span_17 = $.sibling($.child(div_23), 2);
			var text_36 = $.only_child(span_17);

			$.reset(div_23);
			$.reset(div_22);
			$.reset(div_21);
			$.reset(div_5);
			$.reset(div_2);

			var node_33 = $.sibling(div_2, 2);

			{
				var consequent_30 = ($$anchor) => {
					OrderTimeline($$anchor, {
						get timeline() {
							return orderTrackingModule.order.tracking;
						}
					});
				};

				$.if(node_33, ($$render) => {
					if (orderTrackingModule.order.tracking?.length) $$render(consequent_30);
				});
			}

			$.reset(section);

			$.template_effect(
				($0, $1, $2) => {
					$.set_text(text, `Order No : #${orderTrackingModule.order?.orderNo ?? ''}`);
					$.set_text(text_1, `Order Date : ${$0 ?? ''}`);

					$.set_text(text_15, `${orderTrackingModule.order?.shippingAddress?.firstName ?? ''}
										${orderTrackingModule.order?.shippingAddress?.lastName ?? ''} `);

					$.set_text(text_16, ` ${orderTrackingModule.order?.shippingAddress?.address_1 ?? ''} `);
					$.set_text(text_18, ` , ${orderTrackingModule.order?.shippingAddress?.city ?? ''} `);
					$.set_text(text_19, ` ${orderTrackingModule.order?.shippingAddress?.state ?? ''}, `);
					$.set_text(text_20, orderTrackingModule.order?.shippingAddress?.country || orderTrackingModule.order?.shippingAddress?.countryCode);

					$.set_text(text_21, `,
										${orderTrackingModule.order?.shippingAddress?.zip ?? ''}`);

					$.set_text(text_31, `:   ${$1 ?? ''}`);
					$.set_text(text_36, `:   ${$2 ?? ''}`);
				},
				[
					() => date(orderTrackingModule.order?.createdAt),
					() => formatPrice(orderTrackingModule.order?.subtotal || 0, page?.data?.store?.currency?.code) || '0.00',
					() => formatPrice(orderTrackingModule.order?.total || 0, page?.data?.store?.currency?.code)
				]
			);

			$.append($$anchor, section);
		};

		var alternate_3 = ($$anchor) => {
			var div_24 = root_25();
			var a_4 = $.sibling($.child(div_24), 4);
			var node_34 = $.child(a_4);

			Button(node_34, {
				class: 'w-40 py-2 text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_37 = $.text('Return Home');

					$.append($$anchor, text_37);
				},
				$$slots: { default: true }
			});

			$.reset(a_4);
			$.reset(div_24);
			$.append($$anchor, div_24);
		};

		$.if(node, ($$render) => {
			if (orderTrackingModule.loading) $$render(consequent); else if (orderTrackingModule.order && orderTrackingModule.order?.orderNo) $$render(consequent_31, 1); else $$render(alternate_3, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}