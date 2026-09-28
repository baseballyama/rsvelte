import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

import {
	forceSimulation,
	forceX,
	forceManyBody,
	forceCollide,
	forceCenter
} from 'd3-force';

export default function CirclePackForce($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, width, height, xScale, xGet, rGet, zGet } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {number} [manyBodyStrength=5] - The value passed into the `.strength` method on `forceManyBody`, which is used as the `'charge'` property on the simulation. See [the documentation](https://github.com/d3/d3-force#manyBody_strength) for more.
		 * @property {number} [xStrength=0.1] - The value passed into the `.strength` method on `forceX`, which is used as the `'x'` property on the simulation. See [the documentation](https://github.com/d3/d3-force#x_strength) for more.
		 * @property {string|undefined} [nodeColor] - Set a color manually otherwise it will default to the `zScale`.
		 * @property {string} [nodeStroke='#fff'] - The circle's stroke color.
		 * @property {number} [nodeStrokeWidth=1] - The circle's stroke width, in pixels.
		 * @property {boolean} [groupBy=true] - Group the nodes by the return value of the x-scale. If `false`, align all the nodes to the canvas center.
		 */
		/** @type {Props} */
		let {
			manyBodyStrength = 5,
			xStrength = 0.1,
			nodeColor,
			nodeStroke = '#fff',
			nodeStrokeWidth = 1,
			groupBy = true
		} = $$props;

		/* --------------------------------------------
		 * Make a copy because the simulation will alter the objects
		 */
		const initialNodes = $.store_get($$store_subs ??= {}, '$data', data).map((d) => ({ ...d }));

		const simulation = forceSimulation(initialNodes);
		let nodes = [];

		simulation.on('tick', () => {
			nodes = simulation.nodes();
		});

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(
			/* ----------------------------------------------
			 * When variables change, set forces and restart the simulation
			 */
			/** @param {any} d */
			/** @param {any} d */
			// Divide this by two because an svg stroke is drawn halfway out
			nodes
		);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let point = each_array[$$index];

			$$renderer.push(`<circle class="node"${$.attr('r', $.store_get($$store_subs ??= {}, '$rGet', rGet)(point))}${$.attr('fill', nodeColor || $.store_get($$store_subs ??= {}, '$zGet', zGet)(point))}${$.attr('stroke', nodeStroke)}${$.attr('stroke-width', nodeStrokeWidth)}${$.attr('cx', point.x)}${$.attr('cy', point.y)}></circle>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}