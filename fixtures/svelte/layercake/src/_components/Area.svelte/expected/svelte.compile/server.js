import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Area($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, xScale, yScale, extents } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {string} [fill='#ab00d610'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 */
		/** @type {Props} */
		let { fill = '#ab00d610' } = $$props;

		let path = $.derived(() => 'M' + $.store_get($$store_subs ??= {}, '$data', data).map((/** @type {object} */ d) => {
			return $.store_get($$store_subs ??= {}, '$xGet', xGet)(d) + ',' + $.store_get($$store_subs ??= {}, '$yGet', yGet)(d);
		}).join('L'));

		/**	@type {string} **/
		let area = $.derived(() => {
			const yRange = $.store_get($$store_subs ??= {}, '$yScale', yScale).range();

			return path() + ('L' + $.store_get($$store_subs ??= {}, '$xScale', xScale)($.store_get($$store_subs ??= {}, '$extents', extents).x
				? $.store_get($$store_subs ??= {}, '$extents', extents).x[1]
				: 0) + ',' + yRange[0] + 'L' + $.store_get($$store_subs ??= {}, '$xScale', xScale)($.store_get($$store_subs ??= {}, '$extents', extents).x
				? $.store_get($$store_subs ??= {}, '$extents', extents).x[0]
				: 0) + ',' + yRange[0] + 'Z');
		});

		$$renderer.push(`<path class="path-area"${$.attr('d', area())}${$.attr('fill', fill)}></path>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}