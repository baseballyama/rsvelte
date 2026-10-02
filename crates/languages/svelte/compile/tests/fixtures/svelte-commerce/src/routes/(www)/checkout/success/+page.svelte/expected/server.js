import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import { formatPrice } from '$lib/core/utils/index.js';

import {
	CheckCircle2,
	MapPin,
	Package,
	Truck,
	ArrowRight,
	ShoppingBag,
	Mail,
	Calendar
} from '@lucide/svelte';

import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { getUserState, getCartState } from '$lib/core/stores/index.js';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { fade, fly } from 'svelte/transition';
import CheckoutHeader from '$lib/components/checkout/checkout-header.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const userState = getUserState();
		const cartState = getCartState();
		let { data } = $$props;
		const orders = $.derived(() => data.orders?.data || []);
		const firstOrder = $.derived(() => orders()[0]);
		const useremail = $.derived(() => firstOrder()?.userEmail || firstOrder()?.shippingAddress?.email);
		const orderNo = $.derived(() => page.url.searchParams.get('order_no') || firstOrder()?.orderNo);

		const estimatedDeliveryDateMachine = $.derived(() => {
			if (!firstOrder()) return '';

			const date = new Date(firstOrder().createdAt);
			const days = firstOrder().shippingRate?.estimatedMaxDays || 7;

			date.setDate(date.getDate() + days);

			return date.toISOString().split('T')[0];
		});

		const estimatedDeliveryDateDisplay = $.derived(() => {
			if (!firstOrder()) return '';

			const date = new Date(firstOrder().createdAt);
			const days = firstOrder().shippingRate?.estimatedMaxDays || 7;

			date.setDate(date.getDate() + days);

			return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
		});

		onMount(async () => {
			if (!cartState) return;

			const prevCartId = localStorage.getItem('prev_cart_id');

			if (prevCartId) {
				if (typeof cartState.restorePrevCart === 'function') {
					await cartState.restorePrevCart();
				} else if (typeof cartState.resetSingleItemCheckoutSession === 'function') {
					await cartState.resetSingleItemCheckoutSession();
				}

				await cartState.refershCart();
			} else {
				await cartState.refershCart();

				if (!cartState.cart?.lineItems?.length) {
					if (typeof cartState.clear === 'function') {
						await cartState.clear();
					}
				}
			}
		});

		const timelineSteps = [
			{
				label: 'Confirmed',
				icon: CheckCircle2,
				completed: true,
				current: false
			},

			{
				label: 'Processing',
				icon: Package,
				completed: false,
				current: true
			},

			{
				label: 'Shipped',
				icon: Truck,
				completed: false,
				current: false
			}
		];

		$.head('1ax5u20', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Order Confirmed</title>`);
			});
		});

		$$renderer.push(`<div class="min-h-screen bg-[#fafafa] py-12 md:py-5"><div class="container mx-auto max-w-3xl px-4">`);
		CheckoutHeader($$renderer, { step: 4 });
		$$renderer.push(`<!----> <div class="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_40px_rgba(0,0,0,0.02)]"><div class="border-b border-gray-100 bg-white p-3 sm:p-8 text-center md:p-12"><div class="mb-6 flex justify-center"><div class="relative"><div class="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-20"></div> <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-50">`);
		CheckCircle2($$renderer, { class: 'h-8 w-8 text-green-600' });
		$$renderer.push(`<!----></div></div></div> <h1 class="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Thank you for your order</h1> `);

		if (firstOrder()) {
			$$renderer.push(`<!--[0--><p class="mx-auto max-w-lg text-lg text-gray-500 text-sm">We've received your order and we'll notify you as soon as it's on its way.</p>`);
		} else {
			$$renderer.push(`<!--[-1--><p class="mx-auto max-w-lg text-lg text-gray-500 text-sm">Your payment went through. We're still confirming the order details — they'll appear in your account shortly.</p> `);

			if (orderNo()) {
				$$renderer.push(`<!--[0--><div class="mt-6 inline-flex items-center rounded-full border border-gray-100 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">Order #${$.escape(orderNo())}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div> <div class="bg-gray-50/50 px-8 py-10 md:px-12"><div class="relative flex justify-between"><div class="absolute left-0 top-5 h-[2px] w-full bg-gray-200"><div class="h-full w-1/3 bg-primary transition-all duration-1000"></div></div> <!--[-->`);

		const each_array = $.ensure_array_like(timelineSteps);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let step = each_array[i];

			$$renderer.push(`<div class="relative z-10 flex flex-col items-center"><div${$.attr_class(`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-500 ${step.completed
				? 'border-primary bg-primary text-white'
				: step.current
					? 'border-primary bg-white text-primary'
					: 'border-gray-200 bg-white text-gray-400'}`)}>`);

			if (step.icon) {
				$$renderer.push('<!--[-->');
				step.icon($$renderer, { class: 'h-5 w-5' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <span${$.attr_class(`mt-3 text-xs font-semibold uppercase tracking-wider ${step.completed || step.current ? 'text-gray-900' : 'text-gray-400'}`)}>${$.escape(step.label)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (firstOrder()) {
			$$renderer.push(`<!--[0--><div class="border-b border-muted/30 pb-6 p-2 md:p-12"><h2 class="mb-6 text-lg font-bold text-gray-900">Order Summary</h2> <div class="divide-y divide-gray-100"><!--[-->`);

			const each_array_1 = $.ensure_array_like(orders());

			for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
				let { lineItems } = each_array_1[$$index_2];

				$$renderer.push(`<!--[-->`);

				const each_array_2 = $.ensure_array_like(lineItems || []);

				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_2[$$index_1];

					$$renderer.push(`<div class="group flex items-start gap-6 py-6 first:pt-0 last:pb-0"><div class="relative flex-shrink-0 overflow-hidden transition-all duration-300">`);

					LazyImg($$renderer, {
						src: item.thumbnail || '/placeholder.svg',
						alt: item.title,
						class: 'aspect-[3/4] w-16 object-contain sm:w-16'
					});

					$$renderer.push(`<!----></div> <div class="flex flex-1 flex-col transition-all duration-300"><div class="flex justify-between text-base font-semibold text-gray-900"><h3 class="transition-colors"><a${$.attr('href', `/products/${item.slug}`)}>${$.escape(item.title)}</a></h3> <p class="ml-4">${$.escape(formatPrice(item.subtotal, page?.data?.store?.currency?.code))}</p></div> <p class="mt-1 text-sm text-gray-500">${$.escape(formatPrice(item.price, page?.data?.store?.currency?.code))} × ${$.escape(item.qty)}</p> `);

					if (item.variantTitle) {
						$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-gray-400">${$.escape(item.variantTitle)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="grid gap-0 border-b border-muted/30 sm:grid-cols-2"><div class="border-b border-muted/30 p-4 sm:border-b-0 sm:border-r md:p-6"><div class="mb-4 flex text-base items-center gap-2 font-bold text-gray-900">`);
			MapPin($$renderer, { class: 'h-5 w-5 text-primary' });

			$$renderer.push(`<!----> <h3>Shipping Address</h3></div> <div class="text-sm leading-relaxed text-gray-600 px-2"><p class="mb-1 font-bold text-gray-700">${$.escape(firstOrder()?.shippingAddress?.firstName)}
							${$.escape(firstOrder()?.shippingAddress?.lastName)}</p> <p class="text-gray-700">${$.escape(firstOrder()?.shippingAddress?.address_1)}</p> `);

			if (firstOrder()?.shippingAddress?.address_2) {
				$$renderer.push(`<!--[0--><p>${$.escape(firstOrder()?.shippingAddress?.address_2)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p>${$.escape(firstOrder()?.shippingAddress?.city)}, ${$.escape(firstOrder()?.shippingAddress?.state)} ${$.escape(firstOrder()?.shippingAddress?.zip)}</p> <p class="flex items-center gap-2">${$.escape(firstOrder()?.shippingAddress?.phone)}</p></div></div> <div class="p-4 md:p-6"><div class="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">`);
			Calendar($$renderer, { class: 'h-5 w-5 text-primary' });
			$$renderer.push(`<!----> <h3>Estimated Delivery</h3></div> <p class="text-lg px-2 font-bold tracking-tight text-gray-900">${$.escape(estimatedDeliveryDateDisplay())}</p> <div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-2">`);
			Mail($$renderer, { class: 'mt-0.5 h-4 w-4 shrink-0 text-gray-400' });
			$$renderer.push(`<!----> <p class="text-sm leading-relaxed text-gray-700">`);

			if (useremail()) {
				$$renderer.push(`<!--[0-->Confirmation sent to <span class="font-bold text-gray-700">${$.escape(useremail())}</span>. We'll email you again when your items ship.`);
			} else {
				$$renderer.push(`<!--[-1-->We'll email you a confirmation and let you know again when your items ship.`);
			}

			$$renderer.push(`<!--]--></p></div></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="border-b border-muted/30 p-6 md:p-12"><div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">`);
			Package($$renderer, { class: 'mt-0.5 h-5 w-5 shrink-0 text-primary' });
			$$renderer.push(`<!----> <div class="text-sm leading-relaxed text-gray-700"><p class="font-bold text-gray-900">Order details aren't available yet</p> <p class="mt-1">We couldn't load the details for this order right now. Your payment is safe and nothing needs to be paid again. `);

			if (orderNo()) {
				$$renderer.push(`<!--[0-->Quote order <span class="font-bold text-gray-900">#${$.escape(orderNo())}</span> if you need to get in touch.`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></p> <p class="mt-2">Check <a href="/my/orders" class="font-semibold text-primary underline-offset-4 hover:underline">your orders</a> in a few minutes, or <a href="/contact-us" class="font-semibold text-primary underline-offset-4 hover:underline">contact us</a>.</p></div></div></div>`);
		}

		$$renderer.push(`<!--]--> <div class="bg-white p-8 md:p-12"><div class="flex flex-col gap-4 sm:flex-row">`);

		Button($$renderer, {
			href: '/products',
			class: 'group order-1 h-14 flex-1 sm:order-2',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Continue Shopping `);
				ArrowRight($$renderer, { class: 'ml-2 h-4 w-4' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (userState?.user?.role) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'outline',
				href: '/my/orders',
				class: 'order-2 h-14 flex-1 sm:order-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Track My Order`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="mt-8 text-center"><p class="text-sm text-gray-500">Need help with your order? <a href="/contact-us" class="font-semibold text-primary underline-offset-4 hover:underline">Contact us</a></p></div></div></div></div></div> `);

		if (data?.store?.plugins?.googleReviewsOptIn?.active && firstOrder()) {
			$$renderer.push(`<!--[0-->${$.html(`<script src="https://apis.google.com/js/platform.js?onload=renderOptIn" async defer><\/script>
  <script>
    window.renderOptIn = function() {
      window.gapi.load('surveyoptin', function() {
        window.gapi.surveyoptin.render(
          {
            // REQUIRED FIELDS
            "merchant_id": ${data?.store?.plugins?.googleReviewsOptIn?.merchantId},
            "order_id": "${orderNo()}",
            "email": "${cartState?.cart?.email}",
            "delivery_country": "${firstOrder()?.shippingAddress?.countryCode}",
            "estimated_delivery_date": "${estimatedDeliveryDateMachine()}",

            // OPTIONAL FIELDS
          });
      });
    }
  <\/script>`)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}