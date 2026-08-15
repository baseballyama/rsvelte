import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<li class="svelte-1ktd2x7"><span class="name"> </span> <span class="price"> </span> <span class="qty"><button>−</button> <button>+</button></span> <span class="line"> </span></li>`);
var root_1 = $.from_html(`<dt>Discount</dt> <dd> </dd>`, 1);
var root_2 = $.from_html(`<div class="cart svelte-1ktd2x7"><h2> </h2> <ul class="svelte-1ktd2x7"></ul> <label class="coupon">Coupon <input placeholder="Try SAVE10"/></label> <dl class="totals svelte-1ktd2x7"><dt>Subtotal</dt> <dd> </dd> <!> <dt>Tax</dt> <dd> </dd> <dt class="grand svelte-1ktd2x7">Total</dt> <dd class="grand svelte-1ktd2x7"> </dd></dl> <button class="checkout">Checkout</button></div>`);

export default function Component($$anchor, $$props) {
	$.push($$props, false);

	const $coupon = () => $.store_get(coupon, '$coupon', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const subtotal = $.mutable_source();
	const discount = $.mutable_source();
	const tax = $.mutable_source();
	const total = $.mutable_source();
	const itemCount = $.mutable_source();
	let title = $.prop($$props, 'title', 8, 'Cart');
	let taxRate = $.prop($$props, 'taxRate', 8, 0.1);
	const dispatch = createEventDispatcher();
	const coupon = writable('');

	let items = $.mutable_source([
		{ id: 1, name: 'Widget', price: 9.99, qty: 1 },
		{ id: 2, name: 'Gadget', price: 19.5, qty: 2 },
		{ id: 3, name: 'Gizmo', price: 4.25, qty: 5 }
	]);

	function changeQty(id, delta) {
		$.set(items, $.get(items).map((item) => item.id === id
			? { ...item, qty: Math.max(0, item.qty + delta) }
			: item));
	}

	function checkout() {
		dispatch('checkout', { items: $.get(items), total: $.get(total) });
	}

	$.legacy_pre_effect(() => $.get(items), () => {
		$.set(subtotal, $.get(items).reduce((sum, item) => sum + item.price * item.qty, 0));
	});

	$.legacy_pre_effect(() => ($coupon(), $.get(subtotal)), () => {
		$.set(discount, $coupon() === 'SAVE10' ? $.get(subtotal) * 0.1 : 0);
	});

	$.legacy_pre_effect(
		() => (
			$.get(subtotal),
			$.get(discount),
			$.deep_read_state(taxRate())
		),
		() => {
			$.set(tax, ($.get(subtotal) - $.get(discount)) * taxRate());
		}
	);

	$.legacy_pre_effect(() => ($.get(subtotal), $.get(discount), $.get(tax)), () => {
		$.set(total, $.get(subtotal) - $.get(discount) + $.get(tax));
	});

	$.legacy_pre_effect(() => $.get(items), () => {
		$.set(itemCount, $.get(items).reduce((n, item) => n + item.qty, 0));
	});

	$.legacy_pre_effect(() => $.get(total), () => {
		if ($.get(total) > 100) {
			console.log('Big order:', $.get(total));
		}
	});

	$.legacy_pre_effect_reset();
	$.init();

	var div = root_2();
	var h2 = $.child(div);
	var text = $.child(h2);

	$.reset(h2);

	var ul = $.sibling(h2, 2);

	$.each(ul, 5, () => $.get(items), (item) => item.id, ($$anchor, item) => {
		var li = root();
		var span = $.child(li);
		var text_1 = $.child(span, true);

		$.reset(span);

		var span_1 = $.sibling(span, 2);
		var text_2 = $.child(span_1);

		$.reset(span_1);

		var span_2 = $.sibling(span_1, 2);
		var button = $.child(span_2);
		var text_3 = $.sibling(button);
		var button_1 = $.sibling(text_3);

		$.reset(span_2);

		var span_3 = $.sibling(span_2, 2);
		var text_4 = $.child(span_3);

		$.reset(span_3);
		$.reset(li);

		$.template_effect(
			($0, $1) => {
				$.set_text(text_1, ($.get(item), $.untrack(() => $.get(item).name)));
				$.set_text(text_2, `$${$0 ?? ''}`);
				$.set_text(text_3, ` ${($.get(item), $.untrack(() => $.get(item).qty)) ?? ''} `);
				$.set_text(text_4, `$${$1 ?? ''}`);
			},
			[
				() => ($.get(item), $.untrack(() => $.get(item).price.toFixed(2))),
				() => (
					$.get(item),
					$.untrack(() => ($.get(item).price * $.get(item).qty).toFixed(2))
				)
			]
		);

		$.event('click', button, () => changeQty($.get(item).id, -1));
		$.event('click', button_1, () => changeQty($.get(item).id, 1));
		$.append($$anchor, li);
	});

	$.reset(ul);

	var label = $.sibling(ul, 2);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var dl = $.sibling(label, 2);
	var dd = $.sibling($.child(dl), 2);
	var text_5 = $.child(dd);

	$.reset(dd);

	var node = $.sibling(dd, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var dd_1 = $.sibling($.first_child(fragment), 2);
			var text_6 = $.child(dd_1);

			$.reset(dd_1);

			$.template_effect(($0) => $.set_text(text_6, `−$${$0 ?? ''}`), [
				() => ($.get(discount), $.untrack(() => $.get(discount).toFixed(2)))
			]);

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(discount) > 0) $$render(consequent);
		});
	}

	var dd_2 = $.sibling(node, 4);
	var text_7 = $.child(dd_2);

	$.reset(dd_2);

	var dd_3 = $.sibling(dd_2, 4);
	var text_8 = $.child(dd_3);

	$.reset(dd_3);
	$.reset(dl);

	var button_2 = $.sibling(dl, 2);

	$.reset(div);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, `${title() ?? ''} (${$.get(itemCount) ?? ''})`);
			$.set_text(text_5, `$${$0 ?? ''}`);
			$.set_text(text_7, `$${$1 ?? ''}`);
			$.set_text(text_8, `$${$2 ?? ''}`);
			button_2.disabled = $.get(itemCount) === 0;
		},
		[
			() => ($.get(subtotal), $.untrack(() => $.get(subtotal).toFixed(2))),
			() => ($.get(tax), $.untrack(() => $.get(tax).toFixed(2))),
			() => ($.get(total), $.untrack(() => $.get(total).toFixed(2)))
		]
	);

	$.bind_value(input, $coupon, ($$value) => $.store_set(coupon, $$value));
	$.event('click', button_2, checkout);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
