import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { line, curveCardinalClosed } from 'd3-shape';

export default function Radar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, width, height, xGet, config } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {string} [fill='#f0c'] - The radar's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 * @property {string} [stroke='#f0c'] - The radar's stroke color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 * @property {number} [strokeWidth=2] - The radar's stroke width.
		 * @property {number} [fillOpacity=0.5] - The radar's fill opacity.
		 * @property {number} [r=4.5] - Each circle's radius.
		 * @property {string} [circleFill='#f0c'] - Each circle's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 * @property {string} [circleStroke='#fff'] - Each circle's stroke color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 * @property {number} [circleStrokeWidth=1] - Each circle's stroke width.
		 */
		/** @type {Props} */
		let {
			fill = '#f0c',
			stroke = '#f0c',
			strokeWidth = 2,
			fillOpacity = 0.5,
			r = 4.5,
			circleFill = '#f0c',
			circleStroke = '#fff',
			circleStrokeWidth = 1
		} = $$props;

		let angleSlice = $.derived(() => Math.PI * 2 / $.store_get($$store_subs ??= {}, '$config', config).x.length);

		let path = $.derived(() => line().curve(curveCardinalClosed).// @ts-expect-error
		x((d, i) => d * Math.cos(angleSlice() * i - Math.PI / 2)).// @ts-expect-error
		y((d, i) => d * Math.sin(angleSlice() * i - Math.PI / 2)));

		$$renderer.push(`<g${$.attr('transform', `translate(${$.stringify(
			/* The non-D3 line generator way. */
			// let path = $derived(
			// 	values =>
			// 		'M' +
			// 		values
			// 			.map(d => {
			// 				return $rGet(d).map((val, i) => {
			// 					return [
			// 						val * Math.cos(angleSlice * i - Math.PI / 2),
			// 						val * Math.sin(angleSlice * i - Math.PI / 2)
			// 					].join(',');
			// 				});
			// 			})
			// 			.join('L') +
			// 		'z'
			// );
			$.store_get($$store_subs ??= {}, '$width', width) / 2
		)}, ${$.stringify($.store_get($$store_subs ??= {}, '$height', height) / 2)})`)}><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let row = each_array[$$index_1];
			const xVals = $.store_get($$store_subs ??= {}, '$xGet', xGet)(row);

			$$renderer.push(`<path class="path-line svelte-1tzo1w5"${$.attr('d', path()(xVals))}${$.attr('stroke', stroke)}${$.attr('stroke-width', strokeWidth)}${$.attr('fill', fill)}${$.attr('fill-opacity', fillOpacity)}></path><!--[-->`);

			const each_array_1 = $.ensure_array_like(xVals);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let circleR = each_array_1[i];
				const thisAngleSlice = angleSlice() * i - Math.PI / 2;

				$$renderer.push(`<circle${$.attr('cx', circleR * Math.cos(thisAngleSlice))}${$.attr('cy', circleR * Math.sin(thisAngleSlice))}${$.attr('r', r)}${$.attr('fill', circleFill)}${$.attr('stroke', circleStroke)}${$.attr('stroke-width', circleStrokeWidth)}></circle>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}