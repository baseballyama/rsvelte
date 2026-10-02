import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { scaleCanvas } from 'layercake';

export default function Scatter_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, width, height } = getContext('LayerCake');
		const { ctx } = getContext('canvas');

		/**
		 * @typedef {Object} Props
		 * @property {number} [r=5] - The circle's radius.
		 * @property {string} [fill='#0cf'] - The circle's fill color.
		 * @property {string} [stroke='#000'] - The circle's stroke color.
		 * @property {number} [strokeWidth=1] - The circle's stroke width.
		 */
		/** @type {Props} */
		let { r = 5, fill = '#0cf', stroke = '#000', strokeWidth = 1 } = $$props;

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
		// Assign to a local variable: setting properties on `$ctx` directly
		// would re-notify the store and re-trigger this effect
		/**
		 * If you were to have multiple canvas layers
		 * maybe for some artistic layering purposes
		 * put these reset functions in the first layer, not each one
		 * since they should only run once per update
		 */
		/**
		 * Draw our scatterplot
		 */
		/** @type {any} d */
	});
}