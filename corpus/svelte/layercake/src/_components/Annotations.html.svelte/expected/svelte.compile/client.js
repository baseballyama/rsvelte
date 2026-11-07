import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="layercake-annotation svelte-4qzdok"> </div>`);
var root_1 = $.from_html(`<div class="layercake-annotations"></div>`);

export default function Annotations_html($$anchor, $$props) {
	$.push($$props, true);

	/** @typedef {Object} Positions */
	const positions = ['top', 'right', 'bottom', 'left'];

	/**
	 * @typedef {Object} Annotation
	 * @property {string} text - The text content of the annotation
	 * @property {string} [top] - CSS top position in pixels or percentage
	 * @property {string} [right] - CSS right position in pixels or percentage
	 * @property {string} [bottom] - CSS bottom position in pixels or percentage
	 * @property {string} [left] - CSS left position in pixels or percentage
	 */
	/**
	 * @typedef {Object} Props
	 * @property {Array<Annotation>} annotations - A list of annotation objects. It expects values of `top`, `right`, `bottom` and `left` whose values are CSS values like `'10px'` or `'5%'` that will be used to absolutely position the text div.
	 * @property {Function} [getText] - An accessor function to get the field to display.
	 */
	/** @type {Props} */
	let getText = $.prop($$props, 'getText', 3, /** @param {Annotation} d */ (d) => d.text);

	let fillStyle = $.derived(() => (/** @type {Record<string, any>} */ d) => {
		let style = '';

		positions.forEach((pos) => {
			if (d[pos]) {
				style += `${pos}:${d[pos]};`;
			}
		});

		return style;
	});

	var div = root_1();

	$.each(div, 21, () => $$props.annotations, $.index, ($$anchor, d, i) => {
		var div_1 = root();

		$.set_attribute(div_1, 'data-id', i);

		var text = $.only_child(div_1, true);

		$.template_effect(
			($0, $1) => {
				$.set_style(div_1, $0);
				$.set_text(text, $1);
			},
			[() => $.get(fillStyle)($.get(d)), () => getText()($.get(d))]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}