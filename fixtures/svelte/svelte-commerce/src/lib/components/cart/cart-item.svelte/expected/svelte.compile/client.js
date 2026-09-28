import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getCartState, getUserState } from '$lib/core/stores/index.js';
import { Minus, Plus, Trash } from '@lucide/svelte';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import LoadingDotsGif from '$lib/assets/dots-loading.gif';
import { formatPrice, fireGTagEvent } from '$lib/core/utils/index.js';
import { page } from '$app/state';

var root = $.from_html(`<p class="text-sm font-semibold text-muted uppercase tracking-tighter"> </p>`);
var root_1 = $.from_html(`<p class="text-xs font-medium text-gray-500"> </p>`);
var root_2 = $.from_html(`<img alt="Loading..." class="size-3.5"/>`);
var root_3 = $.from_html(`<div class="flex items-center justify-between py-4" role="group"><div class="flex gap-4 w-full"><a class="block shrink-0"><div class="overflow-hidden bg-gray-50 p-1 ring-1 ring-gray-100"><!></div></a> <div class="flex flex-1 flex-col"><div class="flex flex-col gap-1"><a><h4 class="line-clamp-2 text-base font-semibold text-gray-900"> </h4></a> <div class="flex justify-start items-center gap-2"><p class="text-base font-bold pt-1 text-gray-900"> </p> <!></div> <!></div> <div class="mt-4 flex items-center gap-4"><div class="flex items-center gap-2"><div class="flex items-center rounded-md border border-gray-200 bg-white p-0.5 shadow-sm"><button class="rounded-md p-1 hover:bg-gray-100 disabled:opacity-30" aria-label="Subtract 1 from qty"><!></button> <span class="flex min-w-[2rem] items-center justify-center text-xs font-bold text-gray-900"><!></span> <button class="rounded-md p-1 hover:bg-gray-100 disabled:opacity-30" aria-label="Add 1 to qty"><!></button></div> <button class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50" aria-label="Remove item"><!></button></div></div></div></div></div>`);

export default function Cart_item($$anchor, $$props) {
	$.push($$props, true);

	const cartState = getCartState();
	const userState = getUserState();
	let loading = $.state(false);
	let totalPrice = $.derived(() => ($$props.cartProduct?.price || 0) * ($$props.cartProduct?.qty || 0));
	var div = root_3();
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var div_2 = $.child(a);
	var node = $.child(div_2);

	{
		let $0 = $.derived(() => $$props.cartProduct?.thumbnail);
		let $1 = $.derived(() => $$props.cartProduct?.title || 'Product');

		LazyImg(node, {
			get src() {
				return $.get($0);
			},

			get alt() {
				return $.get($1);
			},
			class: 'aspect-[3/4] w-24 object-contain sm:w-20'
		});
	}

	$.reset(div_2);
	$.reset(a);

	var div_3 = $.sibling(a, 2);
	var div_4 = $.child(div_3);
	var a_1 = $.child(div_4);
	var h4 = $.child(a_1);
	var text = $.only_child(h4, true);

	$.reset(a_1);

	var div_5 = $.sibling(a_1, 2);
	var p = $.child(div_5);
	var text_1 = $.only_child(p, true);
	var node_1 = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var p_1 = root();
			var text_2 = $.only_child(p_1);

			$.template_effect(($0) => $.set_text(text_2, `(${$0 ?? ''} each)`), [
				() => formatPrice($$props.cartProduct.price, page?.data?.store?.currency?.code)
			]);

			$.append($$anchor, p_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.cartProduct.qty > 1) $$render(consequent);
		});
	}

	$.reset(div_5);

	var node_2 = $.sibling(div_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_2 = root_1();
			var text_3 = $.only_child(p_2, true);

			$.template_effect(() => $.set_text(text_3, $$props.cartProduct.variantTitle));
			$.append($$anchor, p_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.cartProduct?.variantTitle) $$render(consequent_1);
		});
	}

	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var button = $.child(div_8);
	var node_3 = $.child(button);

	Minus(node_3, { class: 'size-3.5' });
	$.reset(button);

	var span = $.sibling(button, 2);
	var node_4 = $.child(span);

	{
		var consequent_2 = ($$anchor) => {
			var img = root_2();

			$.template_effect(() => $.set_attribute(img, 'src', LoadingDotsGif));
			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var text_4 = $.text();

			$.template_effect(() => $.set_text(text_4, $$props.cartProduct.qty));
			$.append($$anchor, text_4);
		};

		$.if(node_4, ($$render) => {
			if ($.get(loading)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(span);

	var button_1 = $.sibling(span, 2);
	var node_5 = $.child(button_1);

	Plus(node_5, { class: 'size-3.5' });
	$.reset(button_1);
	$.reset(div_8);

	var button_2 = $.sibling(div_8, 2);
	var node_6 = $.child(button_2);

	Trash(node_6, { class: 'size-4' });
	$.reset(button_2);
	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_attribute(a, 'href', `/products/${$$props.cartProduct?.slug ?? ''}`);
			$.set_attribute(a_1, 'href', `/products/${$$props.cartProduct?.slug ?? ''}`);
			$.set_text(text, $$props.cartProduct?.title);
			$.set_text(text_1, $0);
			button.disabled = $.get(loading) || $$props.cartProduct.qty <= 1;
			button_1.disabled = $.get(loading);
		},
		[
			() => formatPrice($.get(totalPrice), page?.data?.store?.currency?.code)
		]
	);

	$.delegated('click', div, (e) => e.stopPropagation());

	$.delegated('click', a, (e) => {
		e.stopPropagation();

		if (cartState) cartState.isOpen = false;
	});

	$.delegated('click', a_1, (e) => {
		e.stopPropagation();

		if (cartState) cartState.isOpen = false;
	});

	$.delegated('click', button, async (e) => {
		e.stopPropagation();
		$.set(loading, true);

		const categoryNames = $$props.cartProduct?.product?.categories?.flatMap?.((c) => c.category?.name) || [];
		const productObj = { ...$$props.cartProduct || {}, categoryNames };

		fireGTagEvent('remove_from_cart', { items: [{ ...productObj }], price: $$props.cartProduct.price });

		await cartState?.update({
			qty: $$props.cartProduct.qty - 1,
			lineId: $$props.cartProduct.id,
			productId: $$props.cartProduct.productId,
			variantId: $$props.cartProduct.variantId
		});

		$.set(loading, false);
	});

	$.delegated('click', button_1, async (e) => {
		e.stopPropagation();
		$.set(loading, true);

		const me = userState?.user;
		const categoryNames = $$props.cartProduct?.product?.categories?.flatMap?.((c) => c.category?.name) || [];
		const productObj = { ...$$props.cartProduct || {}, categoryNames };

		const dataToFire = {
			items: [{ ...productObj, qty: $$props.cartProduct?.qty + 1 }],
			total: $$props.cartProduct?.price * ($$props.cartProduct?.qty + 1),
			qty: $$props.cartProduct?.qty + 1,
			vendorBusinessName: $$props.cartProduct?.vendor?.businessName,
			// Only the pseudonymous id: name and email are PII and must not reach GA4.
			user: { id: me?._id || me?.id }
		};

		fireGTagEvent('add_to_cart', dataToFire);

		await cartState?.update({
			qty: $$props.cartProduct.qty + 1,
			lineId: $$props.cartProduct.id,
			productId: $$props.cartProduct.productId,
			variantId: $$props.cartProduct.variantId
		});

		$.set(loading, false);
	});

	$.delegated('click', button_2, async (e) => {
		e?.preventDefault();
		e?.stopPropagation();

		const categoryNames = $$props.cartProduct?.product?.categories?.flatMap?.((c) => c.category?.name) || [];
		const productObj = { ...$$props.cartProduct || {}, categoryNames };

		fireGTagEvent('remove_from_cart', { items: [{ ...productObj }], price: $$props.cartProduct.price });

		await cartState?.update({
			qty: 0,
			lineId: $$props.cartProduct.id,
			productId: $$props.cartProduct.productId,
			variantId: $$props.cartProduct.variantId
		});
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);