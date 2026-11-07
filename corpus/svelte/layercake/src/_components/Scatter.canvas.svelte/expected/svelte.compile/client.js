import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { scaleCanvas } from 'layercake';

export default function Scatter_canvas($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $ctx = () => $.store_get(ctx, '$ctx', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let r = $.prop($$props, 'r', 3, 5),
		fill = $.prop($$props, 'fill', 3, '#0cf'),
		stroke = $.prop($$props, 'stroke', 3, '#000'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1);

	$.user_effect(() => {
		if (!$width() || !$height() || !$ctx()) return;

		// Assign to a local variable: setting properties on `$ctx` directly
		// would re-notify the store and re-trigger this effect
		const context = $ctx();

		/**
		 * If you were to have multiple canvas layers
		 * maybe for some artistic layering purposes
		 * put these reset functions in the first layer, not each one
		 * since they should only run once per update
		 */
		scaleCanvas(context, $width(), $height());

		context.clearRect(0, 0, $width(), $height());

		/**
		 * Draw our scatterplot
		 */
		$data().forEach((/** @type {any} d */ d) => {
			context.beginPath();
			context.arc($xGet()(d), $yGet()(d), r(), 0, 2 * Math.PI, false);
			context.lineWidth = strokeWidth();
			context.strokeStyle = stroke();
			context.stroke();
			context.fillStyle = fill();
			context.fill();
		});
	});

	$.pop();
	$$cleanup();
}