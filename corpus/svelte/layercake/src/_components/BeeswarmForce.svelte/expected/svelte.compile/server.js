import * as $ from 'svelte/internal/server';
import { getContext, untrack } from 'svelte';
import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';

export default function BeeswarmForce($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, width, height, zGet } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {number} [r=4] - The circle radius size in pixels.
		 * @property {number} [strokeWidth=1] - The circle's stroke width in pixels.
		 * @property {string} [stroke='#fff'] - The circle's stroke color.
		 * @property {number} [xStrength=0.95] - The value passed into the `.strength` method on `forceX`. See [the documentation](https://github.com/d3/d3-force#x_strength).
		 * @property {number} [yStrength=0.075] - The value passed into the `.strength` method on `forceY`. See [the documentation](https://github.com/d3/d3-force#y_strength).
		 * @property {Function} [getTitle] - An accessor function to get the field on the data element to display as a hover label using a `<title>` tag.
		 */
		/** @type {Props} */
		let {
			r = 4,
			strokeWidth = 1,
			stroke = '#fff',
			xStrength = 0.95,
			yStrength = 0.075,
			getTitle
		} = $$props;

		/** @type {any[]} */
		let nodes = [];

		let simulation = $.derived(() => {
			if (!$.store_get($$store_subs ??= {}, '$width', width) || !$.store_get($$store_subs ??= {}, '$height', height) || !$.store_get($$store_subs ??= {}, '$data', data).length) return null;

			const sim = forceSimulation($.store_get($$store_subs ??= {}, '$data', data).map((/** @type {any} */ d) => ({ ...d }))).force('x', forceX().x((d) => $.store_get($$store_subs ??= {}, '$xGet', xGet)(d)).strength(xStrength)).force('y', forceY().y($.store_get($$store_subs ??= {}, '$height', height) / 2).strength(yStrength)).force('collide', forceCollide(r)).stop();

			return sim;
		});

		$$renderer.push(`<g class="bee-group"><!--[-->`);

		const each_array = $.ensure_array_like(
			// Run the simulation for a fixed number of iterations
			// Update nodes state to trigger reactivity
			nodes
		);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let node = each_array[$$index];

			$$renderer.push(`<circle${$.attr('fill', $.store_get($$store_subs ??= {}, '$zGet', zGet)(node))}${$.attr('stroke', stroke)}${$.attr('stroke-width', strokeWidth)}${$.attr('cx', node.x)}${$.attr('cy', node.y)}${$.attr('r', r)}>`);

			if (getTitle) {
				$$renderer.push(`<!--[0--><title>${$.escape(getTitle(node))}</title>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></circle>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}