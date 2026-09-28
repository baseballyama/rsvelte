import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { formatPrice } from '$lib/core/utils';

var root = $.from_html(`<span class="ll-price-was svelte-towglw"> </span>`);
var root_1 = $.from_html(`<div><span class="ll-price-now svelte-towglw"> </span> <!></div>`);

export default function Ll_price($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * Lime price primitive.
	 * Plum selling price with an optional struck-through MRP, matching the
	 * quiet, un-bold luxury treatment of the source product listings.
	 */
	let currencyCode = $.prop($$props, 'currencyCode', 3, ''),
		align = $.prop($$props, 'align', 3, 'center'),
		size = $.prop($$props, 'size', 3, 'md');

	const hasDiscount = $.derived(() => !!$$props.mrp && !!$$props.price && $$props.mrp > $$props.price);
	var div = root_1();
	var span = $.child(div);
	var text = $.only_child(span, true);
	var node = $.sibling(span, 2);

	{
		var consequent = ($$anchor) => {
			var span_1 = root();
			var text_1 = $.only_child(span_1, true);

			$.template_effect(($0) => $.set_text(text_1, $0), [() => formatPrice($$props.mrp, currencyCode())]);
			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($.get(hasDiscount)) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, `ll-price ll-price--${size() ?? ''}`, 'svelte-towglw');
			$.set_style(div, `justify-content: ${align() === 'center' ? 'center' : 'flex-start'};`);
			$.set_text(text, $0);
		},
		[() => formatPrice($$props.price, currencyCode())]
	);

	$.append($$anchor, div);
	$.pop();
}