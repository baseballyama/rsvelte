import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function AxisRadial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { width, height, xScale, extents, config } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {number} [lineLengthFactor=1.1] - How far to extend the lines from the circle's center. A value of `1` puts them at the circle's circumference.
		 * @property {number} [labelPlacementFactor=1.25] - How far to place the labels from the circle's center. A value of `1` puts them at the circle's circumference.
		 */
		/** @type {Props} */
		let { lineLengthFactor = 1.1, labelPlacementFactor = 1.25 } = $$props;

		let max = $.derived(() => $.store_get($$store_subs ??= {}, '$xScale', xScale)(Math.max(...$.store_get($$store_subs ??= {}, '$extents', extents).x)));
		let lineLength = $.derived(() => max() * lineLengthFactor);
		let labelPlacement = $.derived(() => max() * labelPlacementFactor);
		let angleSlice = $.derived(() => Math.PI * 2 / $.store_get($$store_subs ??= {}, '$config', config).x.length);

		/** @param {number} total
		 *  @param {number} i */
		function anchor(total, i) {
			if (i === 0 || i === total / 2) {
				return 'middle';
			} else if (i < total / 2) {
				return 'start';
			}

			return 'end';
		}

		$$renderer.push(`<g${$.attr('transform', `translate(${$.stringify($.store_get($$store_subs ??= {}, '$width', width) / 2)}, ${$.stringify($.store_get($$store_subs ??= {}, '$height', height) / 2)})`)}><circle cx="0" cy="0"${$.attr('r', max())} stroke="#ccc" stroke-width="1" fill="#CDCDCD" fill-opacity="0.1"></circle><circle cx="0" cy="0"${$.attr('r', max() / 2)} stroke="#ccc" stroke-width="1" fill="none"></circle><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$config', config).x);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let label = each_array[i];
			const thisAngleSlice = angleSlice() * i - Math.PI / 2;

			$$renderer.push(`<line x1="0" y1="0"${$.attr('x2', lineLength() * Math.cos(thisAngleSlice))}${$.attr('y2', lineLength() * Math.sin(thisAngleSlice))} stroke="#ccc" stroke-width="1" fill="none"></line><text${$.attr('text-anchor', anchor($.store_get($$store_subs ??= {}, '$config', config).x.length, i))} dy="0.35em" font-size="12px"${$.attr('transform', `translate(${$.stringify(labelPlacement() * Math.cos(thisAngleSlice))}, ${$.stringify(labelPlacement() * Math.sin(thisAngleSlice))})`)}>${$.escape(label)}</text>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}