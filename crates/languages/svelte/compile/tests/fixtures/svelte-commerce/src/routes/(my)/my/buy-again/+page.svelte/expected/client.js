import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { getCartState } from '$lib/core/stores/index.js';
import { formatPrice } from '$lib/core/utils';
import { onMount } from 'svelte';
import { Plus } from '@lucide/svelte';
import { page } from '$app/state';
import { orderService } from '$lib/core/services/index.js';

var root = $.from_html(`<span>Qty : <span class="font-semibold"> </span></span>`);
var root_1 = $.from_html(`<div>Item already in cart</div>`);
var root_2 = $.from_html(`<!> Add to cart`, 1);
var root_3 = $.from_html(`<div class="hidden gap-2 p-5 md:flex lg:gap-5"><a aria-label="Click to view the product details" class="shrink-0"><!></a> <div class="ml-4 flex w-full flex-1 flex-col gap-0.5 pl-4 pr-4"><div class="flex justify-between gap-2 sm:gap-4"><a aria-label="Click to view the product details" class="flex-1 hover:underline"><p> </p></a></div> <!> <div class="flex flex-wrap items-center gap-1">Total : <span class="text-primary-700 whitespace-nowrap font-bold"> </span></div> <div class="relative z-10 flex w-full items-center justify-center p-0 opacity-100 duration-300 laptop:absolute laptop:bottom-0 laptop:translate-y-full laptop:transform laptop:opacity-0 laptop:transition-all laptop:group-hover:translate-y-0 laptop:group-hover:opacity-100"><!></div></div></div> <div class="block gap-2 p-5 md:hidden lg:gap-5"><div class="flex items-center justify-between"><div><a aria-label="Click to view the product details" class="shrink-0"><!></a></div> <div class="mt-2 flex w-full flex-1 flex-col items-center justify-between gap-0.5 pt-1 xl:pl-4 xl:pr-4"><div class="flex justify-between gap-2 sm:gap-4"><a aria-label="Click to view the product details" class="flex-1 hover:underline"><p> </p></a></div> <!> <div class="flex flex-wrap items-center gap-1">Total : <span class="text-primary-700 whitespace-nowrap font-bold"> </span></div> <div class="relative z-10 flex w-full items-center justify-center p-0 opacity-100 duration-300 laptop:absolute laptop:bottom-0 laptop:translate-y-full laptop:transform laptop:opacity-0 laptop:transition-all laptop:group-hover:translate-y-0 laptop:group-hover:opacity-100"><!></div></div></div></div>`, 1);
var root_4 = $.from_html(`<p>No orders found</p>`);
var root_5 = $.from_html(`<section class="flex flex-col gap-10"><h3 class="capitalize">Orders</h3> <div class="grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0"><div class="col-span-2 flex flex-col divide-y"><!></div></div></section>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const cartState = getCartState();
	let data = $.state($.proxy([]));

	onMount(async () => {
		$.set(data, await orderService.buyAgain(), true);
	});

	var section = root_5();

	$.head('o687ox', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Buy Again';
		});
	});

	var div = $.sibling($.child(section), 2);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_4 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => $.get(data), $.index, ($$anchor, item) => {
				var fragment_1 = root_3();
				var div_2 = $.first_child(fragment_1);
				var a = $.child(div_2);
				var node_2 = $.child(a);

				LazyImg(node_2, {
					get src() {
						return $.get(item).img;
					},

					get alt() {
						return $.get(item).title;
					},
					width: '56',
					class: 'h-auto w-14 object-contain object-top'
				});

				$.reset(a);

				var div_3 = $.sibling(a, 2);
				var div_4 = $.child(div_3);
				var a_1 = $.child(div_4);
				var p = $.child(a_1);
				var text = $.only_child(p, true);

				$.reset(a_1);
				$.reset(div_4);

				var node_3 = $.sibling(div_4, 2);

				{
					var consequent = ($$anchor) => {
						var span = root();
						var span_1 = $.sibling($.child(span));
						var text_1 = $.only_child(span_1, true);

						$.reset(span);
						$.template_effect(() => $.set_text(text_1, $.get(item).qty));
						$.append($$anchor, span);
					};

					$.if(node_3, ($$render) => {
						if ($.get(item).qty) $$render(consequent);
					});
				}

				var div_5 = $.sibling(node_3, 2);
				var span_2 = $.sibling($.child(div_5));
				var text_2 = $.only_child(span_2, true);

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var node_4 = $.child(div_6);

				{
					var consequent_1 = ($$anchor) => {
						var div_7 = root_1();

						$.append($$anchor, div_7);
					};

					var d = $.derived(() => cartState?.cart?.lineItems?.some((item1) => item1.productId === $.get(item).productId));

					var alternate = ($$anchor) => {
						{
							let $0 = $.derived(() => !!cartState?.isUpdatingCart);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								variant: 'outline',
								class: 'w-full',
								onclick: () => {
									cartState?.add({
										qty: $.get(item).qty,
										productId: $.get(item).productId,
										variantId: $.get(item).variantId
									});
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_5 = $.first_child(fragment_3);

									Plus(node_5, { class: 'mr-2 max-h-4 max-w-4' });
									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						}
					};

					$.if(node_4, ($$render) => {
						if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.reset(div_6);
				$.reset(div_3);
				$.reset(div_2);

				var div_8 = $.sibling(div_2, 2);
				var div_9 = $.child(div_8);
				var div_10 = $.child(div_9);
				var a_2 = $.child(div_10);
				var node_6 = $.child(a_2);

				LazyImg(node_6, {
					get src() {
						return $.get(item).img;
					},

					get alt() {
						return $.get(item).title;
					},
					width: '56',
					class: 'h-auto w-14 object-contain object-top'
				});

				$.reset(a_2);
				$.reset(div_10);

				var div_11 = $.sibling(div_10, 2);
				var div_12 = $.child(div_11);
				var a_3 = $.child(div_12);
				var p_1 = $.child(a_3);
				var text_3 = $.only_child(p_1, true);

				$.reset(a_3);
				$.reset(div_12);

				var node_7 = $.sibling(div_12, 2);

				{
					var consequent_2 = ($$anchor) => {
						var span_3 = root();
						var span_4 = $.sibling($.child(span_3));
						var text_4 = $.only_child(span_4, true);

						$.reset(span_3);
						$.template_effect(() => $.set_text(text_4, $.get(item).qty));
						$.append($$anchor, span_3);
					};

					$.if(node_7, ($$render) => {
						if ($.get(item).qty) $$render(consequent_2);
					});
				}

				var div_13 = $.sibling(node_7, 2);
				var span_5 = $.sibling($.child(div_13));
				var text_5 = $.only_child(span_5, true);

				$.reset(div_13);

				var div_14 = $.sibling(div_13, 2);
				var node_8 = $.child(div_14);

				{
					var consequent_3 = ($$anchor) => {
						var div_15 = root_1();

						$.append($$anchor, div_15);
					};

					var d_1 = $.derived(() => cartState?.cart?.lineItems?.some((item1) => item1.productId === $.get(item).productId));

					var alternate_1 = ($$anchor) => {
						{
							let $0 = $.derived(() => !!cartState?.isUpdatingCart);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								variant: 'outline',
								class: 'w-full',
								onclick: () => {
									cartState?.add({
										qty: $.get(item).qty,
										productId: $.get(item).productId,
										variantId: $.get(item).variantId
									});
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var node_9 = $.first_child(fragment_5);

									Plus(node_9, { class: 'mr-2 max-h-4 max-w-4' });
									$.next();
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						}
					};

					$.if(node_8, ($$render) => {
						if ($.get(d_1)) $$render(consequent_3); else $$render(alternate_1, -1);
					});
				}

				$.reset(div_14);
				$.reset(div_11);
				$.reset(div_9);
				$.reset(div_8);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(a, 'href', `/product/${$.get(item).slug}?variant_id=${$.get(item).variantId || ''}`);
						$.set_attribute(a_1, 'href', `/product/${$.get(item).slug}?variant_id=${$.get(item).variantId || ''}`);
						$.set_text(text, $.get(item).title);
						$.set_text(text_2, $0);
						$.set_attribute(a_2, 'href', `/product/${$.get(item).slug}?variant_id=${$.get(item).variantId || ''}`);
						$.set_attribute(a_3, 'href', `/product/${$.get(item).slug}?variant_id=${$.get(item).variantId || ''}`);
						$.set_text(text_3, $.get(item).title);
						$.set_text(text_5, $1);
					},
					[
						() => formatPrice($.get(item).price, page?.data?.store?.currency?.code),
						() => formatPrice($.get(item).price, page?.data?.store?.currency?.code)
					]
				);

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		var alternate_2 = ($$anchor) => {
			var p_2 = root_4();

			$.append($$anchor, p_2);
		};

		$.if(node, ($$render) => {
			if ($.get(data).length > 0) $$render(consequent_4); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}