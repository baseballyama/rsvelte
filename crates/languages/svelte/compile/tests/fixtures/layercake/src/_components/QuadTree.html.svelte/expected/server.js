import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { quadtree } from 'd3-quadtree';

export default function QuadTree_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, width, height } = getContext('LayerCake');
		let visible = false;
		let found = {};
		let e = {};

		/**
		 * @typedef {Object} Props
		 * @property {string} [x='x'] - The dimension to search across when moving the mouse left and right.
		 * @property {string} [y='y'] - The dimension to search across when moving the mouse up and down.
		 * @property {number|undefined} [searchRadius] - The number of pixels to search around the mouse's location. This is the third argument passed to [`quadtree.find`](https://github.com/d3/d3-quadtree#quadtree_find) and by default a value of `undefined` means an unlimited range.
		 * @property {Array<Object>|undefined} [dataset] - The dataset to work off of—defaults to $data if left unset. You can pass something custom in here in case you don't want to use the main data or it's in a strange format.
		 * @property {import('svelte').Snippet<[any]>} [children]
		 */
		/** @type {Props} */
		let { x = 'x', y = 'y', searchRadius, dataset, children } = $$props;

		let xGetter = $.derived(() => x === 'x'
			? $.store_get($$store_subs ??= {}, '$xGet', xGet)
			: $.store_get($$store_subs ??= {}, '$yGet', yGet));

		let yGetter = $.derived(() => y === 'y'
			? $.store_get($$store_subs ??= {}, '$yGet', yGet)
			: $.store_get($$store_subs ??= {}, '$xGet', xGet));

		/** @param {MouseEvent} evt */
		function findItem(evt) {
			e = evt;

			const xLayerKey = /** @type {'layerX'|'layerY'} */ (`layer${x.toUpperCase()}`);
			const yLayerKey = /** @type {'layerX'|'layerY'}*/ (`layer${y.toUpperCase()}`);

			found = finder().find(evt[xLayerKey], evt[yLayerKey], searchRadius) || {};
			visible = Object.keys(found).length > 0;
		}

		let finder = $.derived(() => quadtree().extent([
			[-1, -1],
			[
				$.store_get($$store_subs ??= {}, '$width', width) + 1,
				$.store_get($$store_subs ??= {}, '$height', height) + 1
			]
		]).x(xGetter()).y(yGetter()).addAll(dataset || $.store_get($$store_subs ??= {}, '$data', data)));

		$$renderer.push(`<div class="bg svelte-3njubj" role="tooltip"></div> `);

		children?.($$renderer, {
			x: xGetter()(found) || 0,
			y: yGetter()(found) || 0,
			found,
			visible,
			e
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}