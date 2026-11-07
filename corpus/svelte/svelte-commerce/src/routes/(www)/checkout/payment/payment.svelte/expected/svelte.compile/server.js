import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import { ChevronDown, LoaderCircle, LockKeyhole, X } from '@lucide/svelte';
import { formatPrice } from '$lib/core/utils';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import { page } from '$app/state';
import OrderTrustBadges from '$lib/core/components/plugins/order-trust-badges.svelte';
import CouponsDrawer from '$lib/components/coupon/coupons-drawer.svelte';
import CheckoutHeader from '$lib/components/checkout/checkout-header.svelte';
import CheckoutButton from '$lib/components/buttons/checkout-button.svelte';

export default function Payment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { paymentModule, onreview } = $$props;

		// Check if phone is required based on login type
		const isPhoneRequired = page.data?.store?.isPhoneMandatory;

		const isEmailRequired = page.data?.store?.isEmailMandatory;
		const cartState = paymentModule.cartState;
		let showAddress = false;

		$.head('bc83m3', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Checkout - Secure Payment</title>`);
			});
		});

		$$renderer.push(`<div class="min-h-screen py-8"><div class="container mx-auto px-4">`);
		CheckoutHeader($$renderer, { step: 3 });
		$$renderer.push(`<!----> `);

		if (paymentModule.loadingForPaymentMethods) {
			$$renderer.push(`<!--[0--><div class="flex min-h-96 items-center justify-center py-8">`);
			LoaderCircle($$renderer, { class: 'animate-spin' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="grid gap-8 lg:grid-cols-[1fr_400px]"><div class="flex flex-col gap-6">`);

			if (paymentModule.shippingRates?.error?.message) {
				$$renderer.push(`<!--[0--><div class="mb-4 rounded bg-red-50 p-4 text-[11px] font-bold tracking-tight text-red-600 ring-1 ring-red-100">We currently deliver only to <!--[-->`);

				const each_array = $.ensure_array_like(paymentModule.shippingRates?.error?.countriesDeliverable || []);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let country = each_array[index];

					$$renderer.push(`<span class="font-black">${$.escape(country)}</span>`);

					if (index !== paymentModule.shippingRates?.error?.countriesDeliverable?.length - 1) {
						$$renderer.push(`<!--[0-->,
									 `);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->. `);

				if (paymentModule.shippingRates?.error?.moreCountriesCount) {
					$$renderer.push(`<!--[0--><span class="font-black">and ${$.escape(paymentModule.shippingRates.error.moreCountriesCount)} more</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> Your selected country is <span class="font-black">"${$.escape(paymentModule.shippingRates?.error?.selectedCountry)}"</span>.</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="h-fit space-y-6"><h2 class="text-base font-bold uppercase text-gray-900">Select Payment Method</h2> `);

			if (paymentModule.showError) {
				$$renderer.push(`<!--[0--><div class="rounded bg-destructive p-3 text-[11px] font-bold uppercase tracking-tight text-destructive-foreground ring-1 ring-red-100">${$.escape(paymentModule.errorMessage)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (paymentModule.showPaymentMethods) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-1 gap-4"><!--[-->`);

				const each_array_1 = $.ensure_array_like(paymentModule.listOfPaymentMethods);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let method = each_array_1[$$index_2];

					$$renderer.push(`<label${$.attr_class(`relative flex cursor-pointer items-center justify-between rounded-lg border bg-background px-6 py-5 ${paymentModule.selectedPGCode == method?.code && paymentModule.listOfPaymentMethods?.length !== 1
						? 'border-primary ring-1 ring-primary'
						: 'border-border shadow-sm'}`)}><div class="flex items-center gap-4"><div class="relative flex h-5 w-5 items-center justify-center"><input type="radio" name="paymentMethod"${$.attr('value', method?.code)}${$.attr('checked', paymentModule.SELECTED_PG_CODE === method?.code, true)} class="peer h-5 w-5 appearance-none rounded-full border-2 border-gray-200 transition-all checked:border-primary"/> <div class="absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100"></div></div> <div class="flex items-center gap-3">`);

					if (method?.img) {
						$$renderer.push(`<!--[0--><div class="flex h-10 w-12 items-center justify-center rounded border border-border bg-white p-1 shadow-sm"><img${$.attr('src', method.img)}${$.attr('alt', method?.name)} class="h-full w-full object-contain"/></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="flex flex-col"><span class="text-sm font-bold uppercase tracking-tight text-gray-900">${$.escape(method?.name)}</span> `);

					if (method?.description) {
						$$renderer.push(`<!--[0--><span class="text-[10px] font-medium uppercase tracking-tighter text-gray-400">${$.html(method?.description)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div></div> `);

					if (method?.badges?.length) {
						$$renderer.push(`<!--[0--><div class="flex gap-2"><!--[-->`);

						const each_array_2 = $.ensure_array_like(method.badges);

						for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
							let badge = each_array_2[$$index_1];

							$$renderer.push(`<span class="rounded bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 ring-1 ring-gray-100">${$.escape(badge)}</span>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></label>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (paymentModule.shippingRates?.data?.length) {
				$$renderer.push(`<!--[0--><div class="grid h-fit grid-cols-1 space-y-6 pt-4"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Select Shipping Method</h2> <div class="flex flex-col gap-3"><!--[-->`);

				const each_array_3 = $.ensure_array_like(paymentModule.shippingRates?.data);

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let rate = each_array_3[$$index_3];

					$$renderer.push(`<label${$.attr('for', rate.id)}${$.attr_class(`flex items-center justify-between rounded-lg border bg-white p-5 transition-all duration-300 active:scale-[0.99] ${cartState?.cart?.shippingRateId === rate.id ? '' : 'shadow-sm'}`)}><div class="flex items-center gap-4"><div class="relative flex h-5 w-5 items-center justify-center"><input type="radio" name="shippingRate"${$.attr('id', rate.id)}${$.attr('checked', cartState?.cart?.shippingRateId === rate.id, true)} class="peer h-5 w-5 appearance-none rounded-full border-2 border-border transition-all checked:border-primary"/> <div class="absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100"></div></div> <div class="flex flex-col gap-0.5"><span class="text-sm font-bold uppercase tracking-tight text-gray-900">${$.escape(rate.name)}</span> <div class="flex items-center gap-2">`);

					if (!Number.isNaN(Number.parseFloat(rate?.estimated_min_days)) && !Number.isNaN(Number.parseFloat(rate?.estimated_max_days))) {
						$$renderer.push(`<!--[0--><span class="text-[10px] font-bold uppercase tracking-tighter text-primary">${$.escape(rate?.estimated_min_days)} - ${$.escape(rate?.estimated_max_days)} Days</span> <span class="h-1 w-1 rounded-full bg-gray-200"></span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <span class="text-[10px] font-medium uppercase tracking-tighter text-gray-400">${$.escape(rate.description)}</span></div></div></div> <div class="text-right"><span class="text-sm font-bold text-gray-900">${$.escape(rate.base_rate > 0
						? formatPrice(rate.base_rate, page?.data?.store?.currency?.code)
						: 'FREE')}</span></div></label>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="flex flex-col gap-3">`);

			if (cartState.cart.couponCode) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-between px-1 text-sm sm:text-base"><p class="font-medium">Coupon Applied</p> <div class="flex items-center gap-2 rounded-lg bg-gray-100 p-2 px-3"><p class="text-sm font-medium text-gray-600">${$.escape(cartState.cart.couponCode)}</p> `);

				Button($$renderer, {
					variant: 'ghost',
					size: 'icon',
					class: 'h-auto w-auto p-1 text-red-500',
					onclick: paymentModule.removeAppliedCoupon,
					children: ($$renderer) => {
						X($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (cartState?.cart?.shippingAddress) {
				$$renderer.push(`<!--[0--><div class="rounded-lg border border-border bg-white shadow-sm overflow-hidden text-left">`);

				Button($$renderer, {
					variant: 'plain',
					class: 'flex w-full items-center justify-between px-6 py-4 h-auto',
					onclick: () => showAddress = !showAddress,
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex flex-col items-start"><span class="text-sm font-bold text-muted">Delivering Order to</span> <span class="text-sm font-bold uppercase tracking-tight text-gray-900">${$.escape(cartState.cart.shippingAddress.firstName)} ${$.escape(cartState.cart.shippingAddress.lastName)}</span></div> `);

						ChevronDown($$renderer, {
							class: `h-5 w-5 text-gray-400 transition-transform duration-300 ${showAddress ? 'rotate-180' : ''}`
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (showAddress) {
					$$renderer.push(`<!--[0--><div class="border-t border-gray-50 bg-gray-50/30 px-6 py-2"><div class="flex items-start justify-between gap-4"><div class="flex-1"><p class="text-sm leading-relaxed text-gray-600">${$.escape(cartState.cart.shippingAddress?.address_1)},<br/> ${$.escape(cartState.cart.shippingAddress.locality ? cartState.cart.shippingAddress.locality + ',' : '')}
													${$.escape(cartState.cart.shippingAddress.city)}, ${$.escape(cartState.cart.shippingAddress.state)} - ${$.escape(cartState.cart.shippingAddress.zip)}<br/> ${$.escape(cartState.cart.shippingAddress.country)}</p> `);

					if (cartState.cart.shippingAddress?.address_2) {
						$$renderer.push(`<!--[0--><p class="text-xs leading-relaxed text-gray-600">${$.escape(cartState.cart.shippingAddress?.address_2)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					Button($$renderer, {
						variant: 'outline',
						size: 'sm',
						class: 'h-7 px-3',
						onclick: paymentModule.handleAddressChange,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Change`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> `);

					if (cartState.cart.phone) {
						$$renderer.push(`<!--[0--><p class="mt-2 text-xs font-bold text-gray-900">Phone: ${$.escape(cartState.cart.phone)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			CouponsDrawer($$renderer, {});
			$$renderer.push(`<!----> <div class="space-y-4"><div class="space-y-4 rounded-lg border border-border bg-white p-6 shadow-sm"><div class="mb-6 flex flex-col gap-1"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Price Summary</h2> <div class="h-1 w-12 bg-primary"></div></div> `);

			if (paymentModule.loadingForCart) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8">`);
				LoadingDots($$renderer, {});
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="space-y-4"><div class="space-y-3 border-b border-border pb-6"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Subtotal</span> <span class="font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.subtotal, page?.data?.store?.currency?.code))}</span></div> `);

				if (cartState.cart.discountAmount > 0) {
					$$renderer.push(`<!--[0--><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Discount</span> <span class="font-bold uppercase tracking-tight text-orange-600">- ${$.escape(formatPrice(cartState.cart.discountAmount, page?.data?.store?.currency?.code))}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Shipping</span> `);

				if (!cartState.cart.shippingAddress) {
					$$renderer.push(`<!--[0--><span class="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Address required</span>`);
				} else if (cartState.cart.shippingCharges) {
					$$renderer.push(`<!--[1--><span class="font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.shippingCharges, page?.data?.store?.currency?.code))}</span>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600 ring-1 ring-green-100">FREE</span>`);
				}

				$$renderer.push(`<!--]--></div></div> <div class="flex items-center justify-between pt-2"><span class="text-sm font-bold uppercase text-gray-900">Total</span> <span class="text-xl font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.total, page?.data?.store?.currency?.code))}</span></div> <div class="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-4 py-3">`);
				LockKeyhole($$renderer, { class: 'h-3.5 w-3.5 text-gray-400' });
				$$renderer.push(`<!----> <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure 256-bit encryption</p></div> `);

				if ((!isPhoneRequired || cartState?.cart?.phone) && (!isEmailRequired || cartState?.cart?.email) && (cartState?.cart?.shippingAddress || cartState?.cart?.shippingAddressId)) {
					$$renderer.push('<!--[0-->');

					CheckoutButton($$renderer, {
						text: 'Review Order',
						disabledText: 'Select Method',
						onclick: onreview,
						disabled: paymentModule.checkoutDisabled || !!paymentModule.shippingRates?.error?.message,
						loading: paymentModule.paymentLoader
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div> `);
			OrderTrustBadges($$renderer, {});
			$$renderer.push(`<!----></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}