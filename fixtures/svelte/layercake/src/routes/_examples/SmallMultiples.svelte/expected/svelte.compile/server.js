import * as $ from 'svelte/internal/server';
import { calcExtents, flatten } from 'layercake';
import SmallMultipleWrapper from '../../_components/SmallMultipleWrapper.svelte';
import dataSeries from '../../_data/pointSeries.js';

export default function SmallMultiples($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/* --------------------------------------------
		 * Grab the extents of the full dataset
		 */
		const extentGetters = { x: (d) => d.x, y: (d) => d.y };

		const fullExtents = calcExtents(flatten(dataSeries), extentGetters);

		/* --------------------------------------------
		 * Sort by the last value
		 */
		dataSeries.sort((a, b) => {
			return b[b.length - 1].y - a[a.length - 1].y;
		});

		let scale = 'individual';

		$$renderer.push(`<div class="input-container svelte-1tllc63"><label class="svelte-1tllc63"><input type="radio"${$.attr('checked', scale === 'individual', true)} value="individual" class="svelte-1tllc63"/>Individual scale</label> <label class="svelte-1tllc63"><input type="radio"${$.attr('checked', scale === 'shared', true)} value="shared" class="svelte-1tllc63"/>Shared scale</label></div> <div class="group-container svelte-1tllc63"><!--[-->`);

		const each_array = $.ensure_array_like(dataSeries);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let data = each_array[$$index];

			$$renderer.push(`<div class="small-multiple-container svelte-1tllc63">`);
			SmallMultipleWrapper($$renderer, { data, fullExtents, scale, extentGetters });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}