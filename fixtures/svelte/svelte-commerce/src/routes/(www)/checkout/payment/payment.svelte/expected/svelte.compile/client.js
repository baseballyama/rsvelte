import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import { ChevronDown, LoaderCircle, LockKeyhole, X } from '@lucide/svelte';
import { formatPrice } from '$lib/core/utils';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import { page } from '$app/state';
import OrderTrustBadges from '$lib/core/components/plugins/order-trust-badges.svelte';
import CouponsDrawer from '$lib/components/coupon/coupons-drawer.svelte';
import CheckoutHeader from '$lib/components/checkout/checkout-header.svelte';
import CheckoutButton from '$lib/components/buttons/checkout-button.svelte';

var root = $.from_html(`<div class="flex min-h-96 items-center justify-center py-8"><!></div>`);
var root_1 = $.from_html(`<span class="font-black"> </span><!>`, 1);
var root_2 = $.from_html(`<span class="font-black"> </span>`);
var root_3 = $.from_html(`<div class="mb-4 rounded bg-red-50 p-4 text-[11px] font-bold tracking-tight text-red-600 ring-1 ring-red-100">We currently deliver only to <!>. <!> Your selected country is <span class="font-black"> </span>.</div>`);
var root_4 = $.from_html(`<div class="rounded bg-destructive p-3 text-[11px] font-bold uppercase tracking-tight text-destructive-foreground ring-1 ring-red-100"> </div>`);
var root_5 = $.from_html(`<div class="flex h-10 w-12 items-center justify-center rounded border border-border bg-white p-1 shadow-sm"><img class="h-full w-full object-contain"/></div>`);
var root_6 = $.from_html(`<span class="text-[10px] font-medium uppercase tracking-tighter text-gray-400"></span>`);
var root_7 = $.from_html(`<span class="rounded bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 ring-1 ring-gray-100"> </span>`);
var root_8 = $.from_html(`<div class="flex gap-2"></div>`);
var root_9 = $.from_html(`<label><div class="flex items-center gap-4"><div class="relative flex h-5 w-5 items-center justify-center"><input type="radio" name="paymentMethod" class="peer h-5 w-5 appearance-none rounded-full border-2 border-gray-200 transition-all checked:border-primary"/> <div class="absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100"></div></div> <div class="flex items-center gap-3"><!> <div class="flex flex-col"><span class="text-sm font-bold uppercase tracking-tight text-gray-900"> </span> <!></div></div></div> <!></label>`);
var root_10 = $.from_html(`<div class="grid grid-cols-1 gap-4"></div>`);
var root_11 = $.from_html(`<span class="text-[10px] font-bold uppercase tracking-tighter text-primary"> </span> <span class="h-1 w-1 rounded-full bg-gray-200"></span>`, 1);
var root_12 = $.from_html(`<label><div class="flex items-center gap-4"><div class="relative flex h-5 w-5 items-center justify-center"><input type="radio" name="shippingRate" class="peer h-5 w-5 appearance-none rounded-full border-2 border-border transition-all checked:border-primary"/> <div class="absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100"></div></div> <div class="flex flex-col gap-0.5"><span class="text-sm font-bold uppercase tracking-tight text-gray-900"> </span> <div class="flex items-center gap-2"><!> <span class="text-[10px] font-medium uppercase tracking-tighter text-gray-400"> </span></div></div></div> <div class="text-right"><span class="text-sm font-bold text-gray-900"> </span></div></label>`);
var root_13 = $.from_html(`<div class="grid h-fit grid-cols-1 space-y-6  pt-4"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Select Shipping Method</h2> <div class="flex flex-col gap-3"></div></div>`);
var root_14 = $.from_html(`<div class="flex items-center justify-between px-1 text-sm sm:text-base"><p class="font-medium">Coupon Applied</p> <div class="flex items-center gap-2 rounded-lg bg-gray-100 p-2 px-3"><p class="text-sm font-medium text-gray-600"> </p> <!></div></div>`);
var root_15 = $.from_html(`<div class="flex flex-col items-start"><span class="text-sm font-bold text-muted">Delivering Order to</span> <span class="text-sm font-bold uppercase tracking-tight text-gray-900"> </span></div> <!>`, 1);
var root_16 = $.from_html(`<p class="text-xs leading-relaxed text-gray-600"> </p>`);
var root_17 = $.from_html(`<p class="mt-2 text-xs font-bold text-gray-900"> </p>`);
var root_18 = $.from_html(`<div class="border-t border-gray-50 bg-gray-50/30 px-6 py-2"><div class="flex items-start justify-between gap-4"><div class="flex-1"><p class="text-sm leading-relaxed text-gray-600"> <br/> <br/> </p> <!></div> <!></div> <!></div>`);
var root_19 = $.from_html(`<div class="rounded-lg border border-border bg-white shadow-sm overflow-hidden text-left"><!> <!></div>`);
var root_20 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_21 = $.from_html(`<div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Discount</span> <span class="font-bold uppercase tracking-tight text-orange-600"> </span></div>`);
var root_22 = $.from_html(`<span class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Address required</span>`);
var root_23 = $.from_html(`<span class="font-bold text-gray-900"> </span>`);
var root_24 = $.from_html(`<span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600 ring-1 ring-green-100">FREE</span>`);
var root_25 = $.from_html(`<div class="space-y-4"><div class="space-y-3 border-b border-border pb-6"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Subtotal</span> <span class="font-bold text-gray-900"> </span></div> <!> <div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Shipping</span> <!></div></div> <div class="flex items-center justify-between pt-2"><span class="text-sm font-bold uppercase  text-gray-900">Total</span> <span class="text-xl font-bold text-gray-900"> </span></div> <div class="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-4 py-3"><!> <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure 256-bit encryption</p></div> <!></div>`);
var root_26 = $.from_html(`<div class="grid gap-8 lg:grid-cols-[1fr_400px]"><div class="flex flex-col gap-6"><!> <div class="h-fit space-y-6"><h2 class="text-base font-bold uppercase text-gray-900">Select Payment Method</h2> <!> <!></div> <!></div> <div class="flex flex-col gap-3"><!> <!> <!> <div class="space-y-4"><div class="space-y-4 rounded-lg border border-border bg-white p-6 shadow-sm"><div class="mb-6 flex flex-col gap-1"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Price Summary</h2> <div class="h-1 w-12 bg-primary"></div></div> <!></div> <!></div></div></div>`);
var root_27 = $.from_html(`<div class="min-h-screen py-8"><div class="container mx-auto px-4"><!> <!></div></div>`);

export default function Payment($$anchor, $$props) {
	$.push($$props, true);

	const paymentModule = $.prop($$props, 'paymentModule', 7);

	// Check if phone is required based on login type
	const isPhoneRequired = page.data?.store?.isPhoneMandatory;

	const isEmailRequired = page.data?.store?.isEmailMandatory;
	const cartState = paymentModule().cartState;
	let showAddress = $.state(false);
	var div = root_27();

	$.head('bc83m3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Checkout - Secure Payment';
		});
	});

	var div_1 = $.child(div);
	var node = $.child(div_1);

	CheckoutHeader(node, { step: 3 });

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_2 = $.child(div_2);

			LoaderCircle(node_2, { class: 'animate-spin' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var alternate_2 = ($$anchor) => {
			var div_3 = root_26();
			var div_4 = $.child(div_3);
			var node_3 = $.child(div_4);

			{
				var consequent_3 = ($$anchor) => {
					var div_5 = root_3();
					var node_4 = $.sibling($.child(div_5));

					$.each(node_4, 17, () => paymentModule().shippingRates?.error?.countriesDeliverable || [], $.index, ($$anchor, country, index) => {
						var fragment = root_1();
						var span = $.first_child(fragment);
						var text = $.only_child(span, true);
						var node_5 = $.sibling(span);

						{
							var consequent_1 = ($$anchor) => {
								var text_1 = $.text();

								text_1.nodeValue = ',\n									 ';
								$.append($$anchor, text_1);
							};

							$.if(node_5, ($$render) => {
								if (index !== paymentModule().shippingRates?.error?.countriesDeliverable?.length - 1) $$render(consequent_1);
							});
						}

						$.template_effect(() => $.set_text(text, $.get(country)));
						$.append($$anchor, fragment);
					});

					var node_6 = $.sibling(node_4, 2);

					{
						var consequent_2 = ($$anchor) => {
							var span_1 = root_2();
							var text_2 = $.only_child(span_1);

							$.template_effect(() => $.set_text(text_2, `and ${paymentModule().shippingRates.error.moreCountriesCount ?? ''} more`));
							$.append($$anchor, span_1);
						};

						$.if(node_6, ($$render) => {
							if (paymentModule().shippingRates?.error?.moreCountriesCount) $$render(consequent_2);
						});
					}

					var span_2 = $.sibling(node_6, 2);
					var text_3 = $.only_child(span_2);

					$.next();
					$.reset(div_5);
					$.template_effect(() => $.set_text(text_3, `"${paymentModule().shippingRates?.error?.selectedCountry ?? ''}"`));
					$.append($$anchor, div_5);
				};

				$.if(node_3, ($$render) => {
					if (paymentModule().shippingRates?.error?.message) $$render(consequent_3);
				});
			}

			var div_6 = $.sibling(node_3, 2);
			var node_7 = $.sibling($.child(div_6), 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_7 = root_4();
					var text_4 = $.only_child(div_7, true);

					$.template_effect(() => $.set_text(text_4, paymentModule().errorMessage));
					$.append($$anchor, div_7);
				};

				$.if(node_7, ($$render) => {
					if (paymentModule().showError) $$render(consequent_4);
				});
			}

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_8 = root_10();

					$.each(div_8, 21, () => paymentModule().listOfPaymentMethods, $.index, ($$anchor, method) => {
						var label = root_9();
						var div_9 = $.child(label);
						var div_10 = $.child(div_9);
						var input = $.child(div_10);

						$.remove_input_defaults(input);
						$.next(2);
						$.reset(div_10);

						var div_11 = $.sibling(div_10, 2);
						var node_9 = $.child(div_11);

						{
							var consequent_5 = ($$anchor) => {
								var div_12 = root_5();
								var img = $.only_child(div_12);

								$.template_effect(() => {
									$.set_attribute(img, 'src', $.get(method).img);
									$.set_attribute(img, 'alt', $.get(method)?.name);
								});

								$.append($$anchor, div_12);
							};

							$.if(node_9, ($$render) => {
								if ($.get(method)?.img) $$render(consequent_5);
							});
						}

						var div_13 = $.sibling(node_9, 2);
						var span_3 = $.child(div_13);
						var text_5 = $.only_child(span_3, true);
						var node_10 = $.sibling(span_3, 2);

						{
							var consequent_6 = ($$anchor) => {
								var span_4 = root_6();

								$.html(span_4, () => $.get(method)?.description, true);
								$.reset(span_4);
								$.append($$anchor, span_4);
							};

							$.if(node_10, ($$render) => {
								if ($.get(method)?.description) $$render(consequent_6);
							});
						}

						$.reset(div_13);
						$.reset(div_11);
						$.reset(div_9);

						var node_11 = $.sibling(div_9, 2);

						{
							var consequent_7 = ($$anchor) => {
								var div_14 = root_8();

								$.each(div_14, 21, () => $.get(method).badges, $.index, ($$anchor, badge) => {
									var span_5 = root_7();
									var text_6 = $.only_child(span_5, true);

									$.template_effect(() => $.set_text(text_6, $.get(badge)));
									$.append($$anchor, span_5);
								});

								$.reset(div_14);
								$.append($$anchor, div_14);
							};

							$.if(node_11, ($$render) => {
								if ($.get(method)?.badges?.length) $$render(consequent_7);
							});
						}

						$.reset(label);

						$.template_effect(() => {
							$.set_class(label, 1, `relative flex cursor-pointer items-center justify-between rounded-lg border bg-background px-6 py-5 ${paymentModule().selectedPGCode == $.get(method)?.code && paymentModule().listOfPaymentMethods?.length !== 1
								? 'border-primary ring-1 ring-primary'
								: 'border-border shadow-sm'}`);

							$.set_value(input, $.get(method)?.code);
							$.set_checked(input, paymentModule().SELECTED_PG_CODE === $.get(method)?.code);
							$.set_text(text_5, $.get(method)?.name);
						});

						$.delegated('change', input, () => paymentModule().SELECTED_PG_CODE = $.get(method)?.code);
						$.append($$anchor, label);
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_8, ($$render) => {
					if (paymentModule().showPaymentMethods) $$render(consequent_8);
				});
			}

			$.reset(div_6);

			var node_12 = $.sibling(div_6, 2);

			{
				var consequent_10 = ($$anchor) => {
					var div_15 = root_13();
					var div_16 = $.sibling($.child(div_15), 2);

					$.each(div_16, 21, () => paymentModule().shippingRates?.data, $.index, ($$anchor, rate) => {
						var label_1 = root_12();
						var div_17 = $.child(label_1);
						var div_18 = $.child(div_17);
						var input_1 = $.child(div_18);

						$.remove_input_defaults(input_1);
						$.next(2);
						$.reset(div_18);

						var div_19 = $.sibling(div_18, 2);
						var span_6 = $.child(div_19);
						var text_7 = $.only_child(span_6, true);
						var div_20 = $.sibling(span_6, 2);
						var node_13 = $.child(div_20);

						{
							var consequent_9 = ($$anchor) => {
								var fragment_2 = root_11();
								var span_7 = $.first_child(fragment_2);
								var text_8 = $.only_child(span_7);

								$.next(2);
								$.template_effect(() => $.set_text(text_8, `${$.get(rate)?.estimated_min_days ?? ''} - ${$.get(rate)?.estimated_max_days ?? ''} Days`));
								$.append($$anchor, fragment_2);
							};

							var d = $.derived(() => !Number.isNaN(Number.parseFloat($.get(rate)?.estimated_min_days)) && !Number.isNaN(Number.parseFloat($.get(rate)?.estimated_max_days)));

							$.if(node_13, ($$render) => {
								if ($.get(d)) $$render(consequent_9);
							});
						}

						var span_8 = $.sibling(node_13, 2);
						var text_9 = $.only_child(span_8, true);

						$.reset(div_20);
						$.reset(div_19);
						$.reset(div_17);

						var div_21 = $.sibling(div_17, 2);
						var span_9 = $.child(div_21);
						var text_10 = $.only_child(span_9, true);

						$.reset(div_21);
						$.reset(label_1);

						$.template_effect(
							($0) => {
								$.set_attribute(label_1, 'for', $.get(rate).id);
								$.set_class(label_1, 1, `flex items-center justify-between rounded-lg border bg-white p-5 transition-all duration-300 active:scale-[0.99] ${cartState?.cart?.shippingRateId === $.get(rate).id ? '' : 'shadow-sm'}`);
								$.set_attribute(input_1, 'id', $.get(rate).id);
								$.set_checked(input_1, cartState?.cart?.shippingRateId === $.get(rate).id);
								$.set_text(text_7, $.get(rate).name);
								$.set_text(text_9, $.get(rate).description);
								$.set_text(text_10, $0);
							},
							[
								() => $.get(rate).base_rate > 0
									? formatPrice($.get(rate).base_rate, page?.data?.store?.currency?.code)
									: 'FREE'
							]
						);

						$.delegated('change', input_1, () => paymentModule().handleShippingRateChange($.get(rate)));
						$.append($$anchor, label_1);
					});

					$.reset(div_16);
					$.reset(div_15);
					$.append($$anchor, div_15);
				};

				$.if(node_12, ($$render) => {
					if (paymentModule().shippingRates?.data?.length) $$render(consequent_10);
				});
			}

			$.reset(div_4);

			var div_22 = $.sibling(div_4, 2);
			var node_14 = $.child(div_22);

			{
				var consequent_11 = ($$anchor) => {
					var div_23 = root_14();
					var div_24 = $.sibling($.child(div_23), 2);
					var p = $.child(div_24);
					var text_11 = $.only_child(p, true);
					var node_15 = $.sibling(p, 2);

					Button(node_15, {
						variant: 'ghost',
						size: 'icon',
						class: 'h-auto w-auto p-1 text-red-500',
						get onclick() {
							return paymentModule().removeAppliedCoupon;
						},

						children: ($$anchor, $$slotProps) => {
							X($$anchor, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$.reset(div_24);
					$.reset(div_23);
					$.template_effect(() => $.set_text(text_11, cartState.cart.couponCode));
					$.append($$anchor, div_23);
				};

				$.if(node_14, ($$render) => {
					if (cartState.cart.couponCode) $$render(consequent_11);
				});
			}

			var node_16 = $.sibling(node_14, 2);

			{
				var consequent_15 = ($$anchor) => {
					var div_25 = root_19();
					var node_17 = $.child(div_25);

					Button(node_17, {
						variant: 'plain',
						class: 'flex w-full items-center justify-between px-6 py-4 h-auto',
						onclick: () => $.set(showAddress, !$.get(showAddress)),
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_15();
							var div_26 = $.first_child(fragment_4);
							var span_10 = $.sibling($.child(div_26), 2);
							var text_12 = $.only_child(span_10);

							$.reset(div_26);

							var node_18 = $.sibling(div_26, 2);

							{
								let $0 = $.derived(() => $.get(showAddress) ? 'rotate-180' : '');

								ChevronDown(node_18, {
									get class() {
										return `h-5 w-5 text-gray-400 transition-transform duration-300 ${$.get($0) ?? ''}`;
									}
								});
							}

							$.template_effect(() => $.set_text(text_12, `${cartState.cart.shippingAddress.firstName ?? ''} ${cartState.cart.shippingAddress.lastName ?? ''}`));
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_17, 2);

					{
						var consequent_14 = ($$anchor) => {
							var div_27 = root_18();
							var div_28 = $.child(div_27);
							var div_29 = $.child(div_28);
							var p_1 = $.child(div_29);
							var text_13 = $.child(p_1);
							var text_14 = $.sibling(text_13, 2);
							var text_15 = $.sibling(text_14, 2);

							$.reset(p_1);

							var node_20 = $.sibling(p_1, 2);

							{
								var consequent_12 = ($$anchor) => {
									var p_2 = root_16();
									var text_16 = $.only_child(p_2, true);

									$.template_effect(() => $.set_text(text_16, cartState.cart.shippingAddress?.address_2));
									$.append($$anchor, p_2);
								};

								$.if(node_20, ($$render) => {
									if (cartState.cart.shippingAddress?.address_2) $$render(consequent_12);
								});
							}

							$.reset(div_29);

							var node_21 = $.sibling(div_29, 2);

							Button(node_21, {
								variant: 'outline',
								size: 'sm',
								class: 'h-7 px-3',
								get onclick() {
									return paymentModule().handleAddressChange;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Change');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							$.reset(div_28);

							var node_22 = $.sibling(div_28, 2);

							{
								var consequent_13 = ($$anchor) => {
									var p_3 = root_17();
									var text_18 = $.only_child(p_3);

									$.template_effect(() => $.set_text(text_18, `Phone: ${cartState.cart.phone ?? ''}`));
									$.append($$anchor, p_3);
								};

								$.if(node_22, ($$render) => {
									if (cartState.cart.phone) $$render(consequent_13);
								});
							}

							$.reset(div_27);

							$.template_effect(() => {
								$.set_text(text_13, `${cartState.cart.shippingAddress?.address_1 ?? ''},`);

								$.set_text(text_14, ` ${cartState.cart.shippingAddress.locality ? cartState.cart.shippingAddress.locality + ',' : ''}
													${cartState.cart.shippingAddress.city ?? ''}, ${cartState.cart.shippingAddress.state ?? ''} - ${cartState.cart.shippingAddress.zip ?? ''}`);

								$.set_text(text_15, ` ${cartState.cart.shippingAddress.country ?? ''}`);
							});

							$.append($$anchor, div_27);
						};

						$.if(node_19, ($$render) => {
							if ($.get(showAddress)) $$render(consequent_14);
						});
					}

					$.reset(div_25);
					$.append($$anchor, div_25);
				};

				$.if(node_16, ($$render) => {
					if (cartState?.cart?.shippingAddress) $$render(consequent_15);
				});
			}

			var node_23 = $.sibling(node_16, 2);

			CouponsDrawer(node_23, {});

			var div_30 = $.sibling(node_23, 2);
			var div_31 = $.child(div_30);
			var node_24 = $.sibling($.child(div_31), 2);

			{
				var consequent_16 = ($$anchor) => {
					var div_32 = root_20();
					var node_25 = $.child(div_32);

					LoadingDots(node_25, {});
					$.reset(div_32);
					$.append($$anchor, div_32);
				};

				var alternate_1 = ($$anchor) => {
					var div_33 = root_25();
					var div_34 = $.child(div_33);
					var div_35 = $.child(div_34);
					var span_11 = $.sibling($.child(div_35), 2);
					var text_19 = $.only_child(span_11, true);

					$.reset(div_35);

					var node_26 = $.sibling(div_35, 2);

					{
						var consequent_17 = ($$anchor) => {
							var div_36 = root_21();
							var span_12 = $.sibling($.child(div_36), 2);
							var text_20 = $.only_child(span_12);

							$.reset(div_36);

							$.template_effect(($0) => $.set_text(text_20, `- ${$0 ?? ''}`), [
								() => formatPrice(cartState.cart.discountAmount, page?.data?.store?.currency?.code)
							]);

							$.append($$anchor, div_36);
						};

						$.if(node_26, ($$render) => {
							if (cartState.cart.discountAmount > 0) $$render(consequent_17);
						});
					}

					var div_37 = $.sibling(node_26, 2);
					var node_27 = $.sibling($.child(div_37), 2);

					{
						var consequent_18 = ($$anchor) => {
							var span_13 = root_22();

							$.append($$anchor, span_13);
						};

						var consequent_19 = ($$anchor) => {
							var span_14 = root_23();
							var text_21 = $.only_child(span_14, true);

							$.template_effect(($0) => $.set_text(text_21, $0), [
								() => formatPrice(cartState.cart.shippingCharges, page?.data?.store?.currency?.code)
							]);

							$.append($$anchor, span_14);
						};

						var alternate = ($$anchor) => {
							var span_15 = root_24();

							$.append($$anchor, span_15);
						};

						$.if(node_27, ($$render) => {
							if (!cartState.cart.shippingAddress) $$render(consequent_18); else if (cartState.cart.shippingCharges) $$render(consequent_19, 1); else $$render(alternate, -1);
						});
					}

					$.reset(div_37);
					$.reset(div_34);

					var div_38 = $.sibling(div_34, 2);
					var span_16 = $.sibling($.child(div_38), 2);
					var text_22 = $.only_child(span_16, true);

					$.reset(div_38);

					var div_39 = $.sibling(div_38, 2);
					var node_28 = $.child(div_39);

					LockKeyhole(node_28, { class: 'h-3.5 w-3.5 text-gray-400' });
					$.next(2);
					$.reset(div_39);

					var node_29 = $.sibling(div_39, 2);

					{
						var consequent_20 = ($$anchor) => {
							{
								let $0 = $.derived(() => paymentModule().checkoutDisabled || !!paymentModule().shippingRates?.error?.message);

								CheckoutButton($$anchor, {
									text: 'Review Order',
									disabledText: 'Select Method',
									get onclick() {
										return $$props.onreview;
									},

									get disabled() {
										return $.get($0);
									},

									get loading() {
										return paymentModule().paymentLoader;
									}
								});
							}
						};

						$.if(node_29, ($$render) => {
							if ((!isPhoneRequired || cartState?.cart?.phone) && (!isEmailRequired || cartState?.cart?.email) && (cartState?.cart?.shippingAddress || cartState?.cart?.shippingAddressId)) $$render(consequent_20);
						});
					}

					$.reset(div_33);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_19, $0);
							$.set_text(text_22, $1);
						},
						[
							() => formatPrice(cartState.cart.subtotal, page?.data?.store?.currency?.code),
							() => formatPrice(cartState.cart.total, page?.data?.store?.currency?.code)
						]
					);

					$.append($$anchor, div_33);
				};

				$.if(node_24, ($$render) => {
					if (paymentModule().loadingForCart) $$render(consequent_16); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_31);

			var node_30 = $.sibling(div_31, 2);

			OrderTrustBadges(node_30, {});
			$.reset(div_30);
			$.reset(div_22);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if (paymentModule().loadingForPaymentMethods) $$render(consequent); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);