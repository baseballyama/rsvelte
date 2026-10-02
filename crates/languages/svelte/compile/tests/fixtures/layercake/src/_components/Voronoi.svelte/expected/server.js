import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { uniques } from 'layercake';
import { Delaunay } from 'd3-delaunay';

export default function Voronoi($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, width, height } = getContext('LayerCake');

		/** @typedef {[number, number] & { data?: any }} Point */
		/**
		 * @typedef {Object} Props
		 * @property {string|undefined} [stroke] - An optional stroke color, which is likely only useful for testing to make sure the shapes drew correctly.
		 * @property {(event: MouseEvent, point: Array<number>) => void} [onmouseover] - A function that gets called on mouseover events. The first argument is the event, and the second is the point data.
		 */
		/** @type {Props} */
		let { stroke, onmouseover = () => {} } = $$props;

		/**
		 * @param {MouseEvent} e
		 * @param {Point} point
		 */
		function log(e, point) {
			console.log(point, point.data);
			onmouseover(e, point);
		}

		/** @type {Point[]} */
		let points = $.derived(() => $.store_get($$store_subs ??= {}, '$data', data).map((d) => {
			/** @type {Point} */
			const point = [
				$.store_get($$store_subs ??= {}, '$xGet', xGet)(d),
				$.store_get($$store_subs ??= {}, '$yGet', yGet)(d)
			];

			point.data = d;

			return point;
		}));

		let uniquePoints = $.derived(() => uniques(points(), (d) => d.join(), false) ?? []);

		let voronoi = $.derived(() => Delaunay.from(uniquePoints() ?? []).voronoi([
			0,
			0,
			$.store_get($$store_subs ??= {}, '$width', width),
			$.store_get($$store_subs ??= {}, '$height', height)
		]));

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(uniquePoints());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let point = each_array[i];

			$$renderer.push(`<path${$.attr_style(`stroke: ${$.stringify(stroke)}`)} class="voronoi-cell svelte-eilwqv"${$.attr('d', voronoi().renderCell(i))} role="tooltip"></path>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}