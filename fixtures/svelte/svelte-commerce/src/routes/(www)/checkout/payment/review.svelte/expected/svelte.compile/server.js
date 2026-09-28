import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';

import {
	ChevronLeft,
	CreditCard,
	LockKeyhole,
	Mail,
	MapPin,
	Pencil,
	Truck
} from '@lucide/svelte';

import { formatPrice } from '$lib/core/utils';
import { page } from '$app/state';
import OrderTrustBadges from '$lib/core/components/plugins/order-trust-badges.svelte';
import CheckoutHeader from '$lib/components/checkout/checkout-header.svelte';
import CheckoutButton from '$lib/components/buttons/checkout-button.svelte';
import { appendOneTimeCartId } from '$lib/core/utils/index.js';

export default function Review($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { paymentModule, onsubmit, onback } = $$props;
		const cartState = paymentModule.cartState;
		const selectedItems = $.derived(() => cartState.cart?.lineItems?.filter((i) => i.isSelectedForCheckout) || []);
		const selectedPaymentMethod = $.derived(() => paymentModule.listOfPaymentMethods?.find((m) => m.code === paymentModule.SELECTED_PG_CODE));
		const selectedShippingRate = $.derived(() => paymentModule.shippingRates?.data?.find((r) => r.id === cartState.cart?.shippingRateId));
		const currencyCode = $.derived(() => page?.data?.store?.currency?.code);

		$.head('1qy067h', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Checkout - Review Order</title>`);
			});

			$$renderer.push(`<meta name="robots" content="noindex, nofollow"/>`);
		});

		$$renderer.push(`<div class="min-h-screen py-8"><div class="container mx-auto px-4">`);
		CheckoutHeader($$renderer, { step: 3 });
		$$renderer.push(`<!----> <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center"><h1 class="text-xl font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Review Your Order</h1> `);

		Button($$renderer, {
			variant: 'outline',
			onclick: onback,
			class: 'group flex w-fit items-center gap-2',
			children: ($$renderer) => {
				ChevronLeft($$renderer, {
					class: 'size-4 transition-transform duration-300 group-hover:-translate-x-1'
				});

				$$renderer.push(`<!----> Back to Payment`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="grid gap-8 lg:grid-cols-[1fr_400px]"><div class="flex flex-col gap-4"><div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Items (${$.escape(selectedItems().length)})</h2> `);

		Button($$renderer, {
			variant: 'ghost',
			size: 'sm',
			href: appendOneTimeCartId('/checkout/cart'),
			class: 'h-8 text-primary hover:text-primary/80',
			children: ($$renderer) => {
				Pencil($$renderer, { class: 'mr-1 size-3.5' });
				$$renderer.push(`<!----> Edit`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="divide-y divide-gray-100"><!--[-->`);

		const each_array = $.ensure_array_like(selectedItems());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div class="flex gap-3 py-3 text-sm"><div class="relative size-16 shrink-0 overflow-hidden rounded bg-gray-50 p-1"><img${$.attr('src', item?.thumbnail || '/placeholder.svg')}${$.attr('alt', item.title)} class="size-full object-contain"/></div> <div class="flex min-w-0 flex-1 flex-col justify-between py-1"><div><p class="line-clamp-2 font-medium text-gray-900">${$.escape(item.title)}</p> <p class="text-xs text-gray-500">Qty: ${$.escape(item.qty)}</p></div> <p class="font-bold text-gray-900">${$.escape(formatPrice(item.price * item.qty, currencyCode()))}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (cartState.cart?.email || cartState.cart?.phone) {
			$$renderer.push(`<!--[0--><div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="flex items-center gap-2 text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">`);
			Mail($$renderer, { class: 'size-4 text-primary' });
			$$renderer.push(`<!----> Contact</h2> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'sm',
				href: appendOneTimeCartId('/checkout/address'),
				class: 'h-8 text-primary hover:text-primary/80',
				children: ($$renderer) => {
					Pencil($$renderer, { class: 'mr-1 size-3.5' });
					$$renderer.push(`<!----> Edit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="space-y-1 pt-3 text-sm text-gray-600">`);

			if (cartState.cart.email) {
				$$renderer.push(`<!--[0--><p>Email: ${$.escape(cartState.cart.email)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (cartState.cart.phone) {
				$$renderer.push(`<!--[0--><p>Phone: ${$.escape(cartState.cart.phone)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (cartState.cart?.shippingAddress) {
			$$renderer.push(`<!--[0--><div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="flex items-center gap-2 text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">`);
			MapPin($$renderer, { class: 'size-4 text-primary' });
			$$renderer.push(`<!----> Delivery Address</h2> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'sm',
				href: appendOneTimeCartId('/checkout/address'),
				class: 'h-8 text-primary hover:text-primary/80',
				children: ($$renderer) => {
					Pencil($$renderer, { class: 'mr-1 size-3.5' });
					$$renderer.push(`<!----> Edit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="pt-3 text-sm leading-relaxed text-gray-600"><p class="font-bold text-gray-900">${$.escape(cartState.cart.shippingAddress?.firstName)}
								${$.escape(cartState.cart.shippingAddress?.lastName)}</p> <p>${$.escape(cartState.cart.shippingAddress?.address_1)}</p> `);

			if (cartState.cart.shippingAddress?.address_2) {
				$$renderer.push(`<!--[0--><p>${$.escape(cartState.cart.shippingAddress?.address_2)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p>${$.escape(cartState.cart.shippingAddress?.city)}, ${$.escape(cartState.cart.shippingAddress?.state)}, ${$.escape(cartState.cart.shippingAddress?.countryCode)}
								${$.escape(cartState.cart.shippingAddress?.zip)}</p> `);

			if (cartState.cart.shippingAddress?.phone) {
				$$renderer.push(`<!--[0--><p class="mt-1">${$.escape(cartState.cart.shippingAddress?.phone)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (selectedShippingRate()) {
			$$renderer.push(`<!--[0--><div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="flex items-center gap-2 text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">`);
			Truck($$renderer, { class: 'size-4 text-primary' });
			$$renderer.push(`<!----> Shipping Method</h2> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'sm',
				onclick: onback,
				class: 'h-8 text-primary hover:text-primary/80',
				children: ($$renderer) => {
					Pencil($$renderer, { class: 'mr-1 size-3.5' });
					$$renderer.push(`<!----> Edit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center justify-between pt-3 text-sm text-gray-600"><div><p class="font-bold text-gray-900">${$.escape(selectedShippingRate().name)} `);

			if (!Number.isNaN(Number.parseFloat(selectedShippingRate()?.estimated_min_days)) && !Number.isNaN(Number.parseFloat(selectedShippingRate()?.estimated_max_days))) {
				$$renderer.push(`<!--[0-->${$.escape('(' + selectedShippingRate()?.estimated_min_days + ' - ' + selectedShippingRate()?.estimated_max_days + ' business days)')}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></p> `);

			if (selectedShippingRate().description) {
				$$renderer.push(`<!--[0--><p class="text-xs">${$.escape(selectedShippingRate().description)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <span class="font-bold">${$.escape(selectedShippingRate().base_rate > 0
				? formatPrice(selectedShippingRate().base_rate, currencyCode())
				: 'FREE')}</span></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="rounded-lg border border-border bg-background p-6 shadow-sm"><div class="flex items-center justify-between border-b border-border pb-3"><h2 class="flex items-center gap-2 text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">`);
		CreditCard($$renderer, { class: 'size-4 text-primary' });
		$$renderer.push(`<!----> Payment Method</h2> `);

		Button($$renderer, {
			variant: 'ghost',
			size: 'sm',
			onclick: onback,
			class: 'h-8 text-primary hover:text-primary/80',
			children: ($$renderer) => {
				Pencil($$renderer, { class: 'mr-1 size-3.5' });
				$$renderer.push(`<!----> Edit`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="flex items-center gap-3 pt-3">`);

		if (selectedPaymentMethod()?.img) {
			$$renderer.push(`<!--[0--><div class="flex h-10 w-12 items-center justify-center rounded border border-border bg-white p-1 shadow-sm"><img${$.attr('src', selectedPaymentMethod().img)}${$.attr('alt', selectedPaymentMethod()?.name)} class="h-full w-full object-contain"/></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="text-sm font-bold uppercase tracking-tight text-gray-900">${$.escape(selectedPaymentMethod()?.name || 'No payment method selected')}</span></div></div></div> <div class="flex h-fit flex-col gap-3"><div class="space-y-4 rounded-lg border border-border bg-background p-6 shadow-sm"><div class="mb-6 flex flex-col gap-1"><h2 class="text-base font-bold uppercase text-gray-900" style="font-family: var(--font-body);">Price Summary</h2> <div class="h-1 w-12 bg-primary"></div></div> <div class="space-y-4"><div class="space-y-3 border-b border-border pb-6"><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Subtotal</span> <span class="font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.subtotal, currencyCode()))}</span></div> `);

		if (cartState.cart.discountAmount > 0) {
			$$renderer.push(`<!--[0--><div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Discount ${$.escape(cartState.cart.couponCode ? `(${cartState.cart.couponCode})` : '')}</span> <span class="font-bold uppercase tracking-tight text-orange-600">- ${$.escape(formatPrice(cartState.cart.discountAmount, currencyCode()))}</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex justify-between text-sm"><span class="font-medium text-gray-500">Shipping</span> `);

		if (cartState.cart.shippingCharges) {
			$$renderer.push(`<!--[0--><span class="font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.shippingCharges, currencyCode()))}</span>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600 ring-1 ring-green-100">FREE</span>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="flex items-center justify-between pt-2"><span class="text-sm font-bold uppercase text-gray-900">Total</span> <span class="text-xl font-bold text-gray-900">${$.escape(formatPrice(cartState.cart.total, currencyCode()))}</span></div> `);

		if (paymentModule.showError) {
			$$renderer.push(`<!--[0--><div class="rounded bg-destructive p-3 text-[11px] font-bold uppercase tracking-tight text-destructive-foreground ring-1 ring-red-100">${$.escape(paymentModule.errorMessage)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-4 py-3">`);
		LockKeyhole($$renderer, { class: 'h-3.5 w-3.5 text-gray-400' });
		$$renderer.push(`<!----> <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure 256-bit encryption</p></div> `);

		CheckoutButton($$renderer, {
			text: 'Confirm Order',
			onclick: onsubmit,
			disabled: paymentModule.checkoutDisabled,
			loading: paymentModule.paymentLoader
		});

		$$renderer.push(`<!----></div></div> `);
		OrderTrustBadges($$renderer, {});
		$$renderer.push(`<!----></div></div></div></div>`);
	});
}