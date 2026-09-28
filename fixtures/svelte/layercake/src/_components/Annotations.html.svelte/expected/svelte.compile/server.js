import * as $ from 'svelte/internal/server';

export default function Annotations_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			annotations,
			getText = /** @param {Annotation} d */ (d) => d.text
		} = $$props;

		let fillStyle = $.derived(() => (/** @type {Record<string, any>} */ d) => {
			let style = '';

			positions.forEach((pos) => {
				if (d[pos]) {
					style += `${pos}:${d[pos]};`;
				}
			});

			return style;
		});

		$$renderer.push(`<div class="layercake-annotations"><!--[-->`);

		const each_array = $.ensure_array_like(annotations);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let d = each_array[i];

			$$renderer.push(`<div class="layercake-annotation svelte-4qzdok"${$.attr('data-id', i)}${$.attr_style(fillStyle()(d))}>${$.escape(getText(d))}</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}