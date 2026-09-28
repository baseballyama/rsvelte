import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getCartState, getProductState } from '$lib/core/stores/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { formatPrice } from '$lib/core/utils/index.js';
import { ArrowLeft, AlertCircle, RefreshCw } from '@lucide/svelte';
import { page } from '$app/state';

var root = $.from_html(`<!> Continue Shopping`, 1);
var root_1 = $.from_html(`<!> Redirecting...`, 1);
var root_2 = $.from_html(`<div class="item svelte-1fk4lta"><a class="item-image svelte-1fk4lta"><img class="svelte-1fk4lta"/></a> <div class="item-details svelte-1fk4lta"><a class="item-title"> </a> <div class="item-price-qty svelte-1fk4lta"><span> </span> <span>×</span> <span> </span></div></div></div>`);
var root_3 = $.from_html(`<div class="order-summary svelte-1fk4lta"><h2 class="svelte-1fk4lta">Order Summary</h2> <div class="items-list svelte-1fk4lta"></div> <div class="price-summary svelte-1fk4lta"><div class="price-row svelte-1fk4lta"><span>Subtotal</span> <span> </span></div>  <div class="price-row total svelte-1fk4lta"><span>Total</span> <span> </span></div></div></div>`);
var root_4 = $.from_html(`<div class="payment-failed-container svelte-1fk4lta"><div class="payment-failed-card svelte-1fk4lta"><div class="payment-failed-header svelte-1fk4lta"><div class="icon-wrapper svelte-1fk4lta"><!></div> <h1 class="svelte-1fk4lta">Payment Not Completed</h1> <p class="svelte-1fk4lta">We weren't able to process your payment. Your order has not been placed and you have not been charged.</p></div> <div class="action-buttons svelte-1fk4lta"><!> <!></div> <!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let loadingPayment = $.state(false);
	const cartState = getCartState();

	function handleRetry() {
		$.set(loadingPayment, true);
		window.location.href = '/checkout/cart';
	}

	var div = root_4();

	$.head('1fk4lta', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Payment Not Completed';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	AlertCircle(node, { size: '48', class: 'text-destructive' });
	$.reset(div_3);
	$.next(4);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_1 = $.child(div_4);

	Button(node_1, {
		variant: 'outline',
		class: 'back-button',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			ArrowLeft(node_2, { class: 'mr-2', size: '16' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	Button(node_3, {
		class: 'retry-button',
		onclick: handleRetry,
		get disabled() {
			return $.get(loadingPayment);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root_1();
					var node_5 = $.first_child(fragment_2);

					RefreshCw(node_5, { class: 'mr-2 h-4 w-4 animate-spin' });
					$.next();
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var text = $.text('Try Payment Again');

					$.append($$anchor, text);
				};

				$.if(node_4, ($$render) => {
					if ($.get(loadingPayment)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var node_6 = $.sibling(div_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_3();
			var div_6 = $.sibling($.child(div_5), 2);

			$.each(div_6, 21, () => cartState.cart?.lineItems, $.index, ($$anchor, $$item) => {
				let thumbnail = () => $.get($$item).thumbnail;
				let title = () => $.get($$item).title;
				let qty = () => $.get($$item).qty;
				let price = () => $.get($$item).price;
				let variant = () => $.get($$item).variant;
				let slug = () => $.get($$item).slug;
				var div_7 = root_2();
				var a = $.child(div_7);
				var img = $.only_child(a);
				var div_8 = $.sibling(a, 2);
				var a_1 = $.child(div_8);
				var text_1 = $.only_child(a_1, true);
				var div_9 = $.sibling(a_1, 2);
				var span = $.child(div_9);
				var text_2 = $.only_child(span, true);
				var span_1 = $.sibling(span, 4);
				var text_3 = $.only_child(span_1, true);

				$.reset(div_9);
				$.reset(div_8);
				$.reset(div_7);

				$.template_effect(
					($0) => {
						$.set_attribute(a, 'href', `/products/${slug()}?variant_id=${variant()?.id ?? ''}`);
						$.set_attribute(img, 'src', thumbnail() || '/images/placeholder.png');
						$.set_attribute(img, 'alt', title());
						$.set_attribute(a_1, 'href', `/products/${slug()}`);
						$.set_text(text_1, title());
						$.set_text(text_2, $0);
						$.set_text(text_3, qty());
					},
					[
						() => formatPrice(price(), page?.data?.store?.currency?.code)
					]
				);

				$.append($$anchor, div_7);
			});

			$.reset(div_6);

			var div_10 = $.sibling(div_6, 2);
			var div_11 = $.child(div_10);
			var span_2 = $.sibling($.child(div_11), 2);
			var text_4 = $.only_child(span_2, true);

			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var span_3 = $.sibling($.child(div_12), 2);
			var text_5 = $.only_child(span_3, true);

			$.reset(div_12);
			$.reset(div_10);
			$.reset(div_5);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_4, $0);
					$.set_text(text_5, $1);
				},
				[
					() => formatPrice(cartState.cart?.subtotal, page?.data?.store?.currency?.code),
					() => formatPrice(cartState.cart?.total, page?.data?.store?.currency?.code)
				]
			);

			$.append($$anchor, div_5);
		};

		$.if(node_6, ($$render) => {
			if (cartState?.cart?.lineItems?.length) $$render(consequent_1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}