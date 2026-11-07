import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="layercake-annotation svelte-fk76pg"> </div>`);
var root_1 = $.from_html(`<div class="layercake-annotations"></div>`);

export default function AnnotationsData_html($$anchor, $$props) {
	$.push($$props, true);

	const $percentRange = () => $.store_get(percentRange, '$percentRange', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let getText = $.prop($$props, 'getText', 3, (d) => d.text),
		pr = $.prop($$props, 'pr', 19, $percentRange);

	let units = $.derived(() => pr() === true ? '%' : 'px');
	var div = root_1();

	$.each(div, 21, () => $$props.annotations, $.index, ($$anchor, d, i) => {
		var div_1 = root();

		$.set_attribute(div_1, 'data-id', i);

		let styles;
		var text = $.only_child(div_1, true);

		$.template_effect(
			($0, $1, $2) => {
				styles = $.set_style(div_1, '', styles, { left: $0, top: $1 });
				$.set_text(text, $2);
			},
			[
				() => `calc(${$xGet()($.get(d))}${$.get(units)} + ${$.get(d).dx || 0}px)`,
				() => `calc(${$yGet()($.get(d))}${$.get(units)} + ${$.get(d).dy || 0}px)`,
				() => getText()($.get(d))
			]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}