import * as $ from 'svelte/internal/server';
import { getCartState, getProductState } from '$lib/core/stores/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { formatPrice } from '$lib/core/utils/index.js';
import { ArrowLeft, AlertCircle, RefreshCw } from '@lucide/svelte';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loadingPayment = false;
		const cartState = getCartState();
		let { data } = $$props;

		function handleRetry() {
			loadingPayment = true;
			window.location.href = '/checkout/cart';
		}

		$.head('1fk4lta', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Payment Not Completed</title>`);
			});
		});

		$$renderer.push(`<div class="payment-failed-container svelte-1fk4lta"><div class="payment-failed-card svelte-1fk4lta"><div class="payment-failed-header svelte-1fk4lta"><div class="icon-wrapper svelte-1fk4lta">`);
		AlertCircle($$renderer, { size: '48', class: 'text-destructive' });
		$$renderer.push(`<!----></div> <h1 class="svelte-1fk4lta">Payment Not Completed</h1> <p class="svelte-1fk4lta">We weren't able to process your payment. Your order has not been placed and you have not been charged.</p></div> <div class="action-buttons svelte-1fk4lta">`);

		Button($$renderer, {
			variant: 'outline',
			class: 'back-button',
			href: '/',
			children: ($$renderer) => {
				ArrowLeft($$renderer, { class: 'mr-2', size: '16' });
				$$renderer.push(`<!----> Continue Shopping`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			class: 'retry-button',
			onclick: handleRetry,
			disabled: loadingPayment,
			children: ($$renderer) => {
				if (loadingPayment) {
					$$renderer.push('<!--[0-->');
					RefreshCw($$renderer, { class: 'mr-2 h-4 w-4 animate-spin' });
					$$renderer.push(`<!----> Redirecting...`);
				} else {
					$$renderer.push(`<!--[-1-->Try Payment Again`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		if (cartState?.cart?.lineItems?.length) {
			$$renderer.push(`<!--[0--><div class="order-summary svelte-1fk4lta"><h2 class="svelte-1fk4lta">Order Summary</h2> <div class="items-list svelte-1fk4lta"><!--[-->`);

			const each_array = $.ensure_array_like(cartState.cart?.lineItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { thumbnail, title, qty, price, variant, slug } = each_array[$$index];

				$$renderer.push(`<div class="item svelte-1fk4lta"><a${$.attr('href', `/products/${slug}?variant_id=${variant?.id ?? ''}`)} class="item-image svelte-1fk4lta"><img${$.attr('src', thumbnail || '/images/placeholder.png')}${$.attr('alt', title)} class="svelte-1fk4lta"/></a> <div class="item-details svelte-1fk4lta"><a${$.attr('href', `/products/${slug}`)} class="item-title">${$.escape(title)}</a> <div class="item-price-qty svelte-1fk4lta"><span>${$.escape(formatPrice(price, page?.data?.store?.currency?.code))}</span> <span>×</span> <span>${$.escape(qty)}</span></div></div></div>`);
			}

			$$renderer.push(`<!--]--></div> <div class="price-summary svelte-1fk4lta"><div class="price-row svelte-1fk4lta"><span>Subtotal</span> <span>${$.escape(formatPrice(cartState.cart?.subtotal, page?.data?.store?.currency?.code))}</span></div>  <div class="price-row total svelte-1fk4lta"><span>Total</span> <span>${$.escape(formatPrice(cartState.cart?.total, page?.data?.store?.currency?.code))}</span></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}