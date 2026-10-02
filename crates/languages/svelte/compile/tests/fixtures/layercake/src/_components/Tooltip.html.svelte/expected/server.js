import * as $ from 'svelte/internal/server';

export default function Tooltip_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {MouseEvent} event - The mouse event that triggered the tooltip.
		 * @property {number} [offset=-35] - A y-offset from the hover point, in pixels.
		 * @property {import('svelte').Snippet} [children]
		 */
		/** @type {Props} */
		let { event, offset = -35, children } = $$props;

		if (event.layerX !== undefined && event.layerY !== undefined) {
			$$renderer.push(`<!--[0--><div class="tooltip svelte-1l32xnv"${$.attr_style(` top:${$.stringify(event.layerY + offset)}px; left:${$.stringify(event.layerX)}px; `)}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}