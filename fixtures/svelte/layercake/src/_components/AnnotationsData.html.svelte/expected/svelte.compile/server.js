import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function AnnotationsData_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { xGet, yGet, percentRange } = getContext('LayerCake');

		/**
		 * @typedef {Object} ArrowSource
		 * @property {string} anchor - Anchor position, format: `{left|middle|right}-{top|middle|bottom}`
		 * @property {number} [dx] - Optional horizontal pixel offset
		 * @property {number} [dy] - Optional vertical pixel offset
		 */
		/**
		 * @typedef {Object} ArrowTarget
		 * @property {string|number} [x] - X position (can be percentage string like "68%" or data value)
		 * @property {string|number} [y] - Y position (can be percentage string like "48%" or data value)
		 * @property {number} [dx] - Optional horizontal pixel offset
		 * @property {number} [dy] - Optional vertical pixel offset
		 */
		/**
		 * @typedef {Object} Arrow
		 * @property {boolean} [clockwise=true] - Direction of arrow curve
		 * @property {ArrowSource} source - Arrow starting point configuration
		 * @property {ArrowTarget} target - Arrow ending point configuration
		 */
		/**
		 * @typedef {Object} Annotation
		 * @property {string} text - The text content of the annotation
		 * @property {number} [dx] - Optional horizontal pixel offset
		 * @property {number} [dy] - Optional vertical pixel offset
		 * @property {number} [top] - CSS top position in pixels
		 * @property {number} [right] - CSS right position in pixels
		 * @property {number} [bottom] - CSS bottom position in pixels
		 * @property {number} [left] - CSS left position in pixels
		 * @property {Array<Arrow>} [arrows] - Optional array of arrow configurations
		 * @description Additional dynamic properties can be added using data keys (e.g., [xKey]: value, [yKey]: value) for positioning based on chart data dimensions
		 */
		/**
		 * @typedef {Object} Props
		 * @property {Array<Annotation>} annotations - A list of annotation objects.
		 * @property {Function} [getText] - An accessor function to get the field to display.
		 * @property {boolean} [pr] - If `true` will set the `top` and `left` CSS positions to percentages instead of pixels.
		 */
		/** @type {Props} */
		let {
			annotations,
			getText = (d) => d.text,
			pr = $.store_get($$store_subs ??= {}, '$percentRange', percentRange)
		} = $$props;

		let units = $.derived(() => pr === true ? '%' : 'px');

		$$renderer.push(`<div class="layercake-annotations"><!--[-->`);

		const each_array = $.ensure_array_like(annotations);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let d = each_array[i];

			$$renderer.push(`<div class="layercake-annotation svelte-fk76pg"${$.attr('data-id', i)}${$.attr_style('', {
				left: `calc(${$.store_get($$store_subs ??= {}, '$xGet', xGet)(d)}${units()} + ${d.dx || 0}px)`,
				top: `calc(${$.store_get($$store_subs ??= {}, '$yGet', yGet)(d)}${units()} + ${d.dy || 0}px)`
			})}>${$.escape(getText(d))}</div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}