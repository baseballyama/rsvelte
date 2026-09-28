import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Key_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * @typedef {Object} Props
		 * @property {string} [shape='square'] - The shape for each item. Can be 'circle', 'line', or 'square';
		 * @property {string} [align='start'] - Sets the CSS flexbox justify-content setting for the box as a whole. Can be 'start', 'center' or 'end'.
		 * @property {Function|Object} [lookup] - Either a function that takes the value and returns a formatted string, or an object of values. If a given value is not present in a lookup object, it returns the original value.
		 * @property {boolean} [capitalize=true] - Capitalize the first character.
		 */
		/** @type {Props} */
		let { shape = 'square', align = 'start', lookup, capitalize = true } = $$props;

		const { zDomain, zScale } = getContext('LayerCake');

		function cap(val) {
			return String(val).replace(/^\w/, (d) => d.toUpperCase());
		}

		function displayName(val) {
			if (lookup) {
				return typeof lookup === 'function' ? lookup(val) : lookup[val] || val;
			}

			return capitalize === true ? cap(val) : val;
		}

		$$renderer.push(`<div class="key svelte-1yljwon"${$.attr_style(`justify-content: ${$.stringify(align === 'end' ? 'flex-end' : align)};`)}><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$zDomain', zDomain));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div class="key-item svelte-1yljwon"><div${$.attr_class(`chip chip__${$.stringify(shape)}`, 'svelte-1yljwon')}${$.attr_style(`background: ${$.stringify(shape === `line`
				? `linear-gradient(-45deg, #ffffff 40%, ${$.store_get($$store_subs ??= {}, '$zScale', zScale)(item)} 41%, ${$.store_get($$store_subs ??= {}, '$zScale', zScale)(item)} 59%, #ffffff 60%)`
				: $.store_get($$store_subs ??= {}, '$zScale', zScale)(item))};`)}></div> <div class="name svelte-1yljwon">${$.escape(displayName(item))}</div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}