import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="key-item svelte-1yljwon"><div></div> <div class="name svelte-1yljwon"> </div></div>`);
var root_1 = $.from_html(`<div class="key svelte-1yljwon"></div>`);

export default function Key_html($$anchor, $$props) {
	$.push($$props, true);

	const $zDomain = () => $.store_get(zDomain, '$zDomain', $$stores);
	const $zScale = () => $.store_get(zScale, '$zScale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * @typedef {Object} Props
	 * @property {string} [shape='square'] - The shape for each item. Can be 'circle', 'line', or 'square';
	 * @property {string} [align='start'] - Sets the CSS flexbox justify-content setting for the box as a whole. Can be 'start', 'center' or 'end'.
	 * @property {Function|Object} [lookup] - Either a function that takes the value and returns a formatted string, or an object of values. If a given value is not present in a lookup object, it returns the original value.
	 * @property {boolean} [capitalize=true] - Capitalize the first character.
	 */
	/** @type {Props} */
	let shape = $.prop($$props, 'shape', 3, 'square'),
		align = $.prop($$props, 'align', 3, 'start'),
		capitalize = $.prop($$props, 'capitalize', 3, true);

	const { zDomain, zScale } = getContext('LayerCake');

	function cap(val) {
		return String(val).replace(/^\w/, (d) => d.toUpperCase());
	}

	function displayName(val) {
		if ($$props.lookup) {
			return typeof $$props.lookup === 'function' ? $$props.lookup(val) : $$props.lookup[val] || val;
		}

		return capitalize() === true ? cap(val) : val;
	}

	var div = root_1();

	$.each(div, 5, $zDomain, $.index, ($$anchor, item) => {
		var div_1 = root();
		var div_2 = $.child(div_1);
		var div_3 = $.sibling(div_2, 2);
		var text = $.only_child(div_3, true);

		$.reset(div_1);

		$.template_effect(
			($0, $1) => {
				$.set_class(div_2, 1, `chip chip__${shape() ?? ''}`, 'svelte-1yljwon');
				$.set_style(div_2, `background: ${$0 ?? ''};`);
				$.set_text(text, $1);
			},
			[
				() => shape() === `line`
					? `linear-gradient(-45deg, #ffffff 40%, ${$zScale()($.get(item))} 41%, ${$zScale()($.get(item))} 59%, #ffffff 60%)`
					: $zScale()($.get(item)),
				() => displayName($.get(item))
			]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_style(div, `justify-content: ${(align() === 'end' ? 'flex-end' : align()) ?? ''};`));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}