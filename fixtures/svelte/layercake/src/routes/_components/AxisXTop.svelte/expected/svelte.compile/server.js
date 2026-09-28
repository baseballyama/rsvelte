import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import AxisXTop from '../../_components/AxisXTop.svelte';
import data from '../../_data/points.csv';

export default function AxisXTop_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	let tickMarks = false;
	let snapLabels = false;
	let gridlines = true;
	let baseline = true;
	let tickMarkLength = 6;
	let tickGutter = 0;
	let dx = 0;
	let dy = -4;

	$$renderer.push(`<div class="component-container svelte-t9i4r6"><div class="props svelte-t9i4r6"><label class="svelte-t9i4r6"><input type="checkbox"${$.attr('checked', tickMarks, true)} class="svelte-t9i4r6"/> tickMarks</label> <label class="svelte-t9i4r6"><input type="checkbox"${$.attr('checked', gridlines, true)} class="svelte-t9i4r6"/> gridlines</label> <label class="svelte-t9i4r6"><input type="checkbox"${$.attr('checked', baseline, true)} class="svelte-t9i4r6"/> baseline</label> <label class="svelte-t9i4r6"><input type="checkbox"${$.attr('checked', snapLabels, true)} class="svelte-t9i4r6"/> snapLabels</label> <label${$.attr_class('number svelte-t9i4r6', void 0, { 'disabled': !tickMarks })}><span${$.attr_class('svelte-t9i4r6', void 0, { 'disabled': !tickMarks })}>tickMarkLength</span> <input type="number"${$.attr('value', tickMarkLength)}${$.attr('disabled', !tickMarks, true)} class="svelte-t9i4r6"/></label> <label class="number svelte-t9i4r6">tickGutter <input type="number"${$.attr('value', tickGutter)} class="svelte-t9i4r6"/></label> <label class="number svelte-t9i4r6">dx <input type="number"${$.attr('value', dx)} class="svelte-t9i4r6"/></label> <label class="number svelte-t9i4r6">dy <input type="number"${$.attr('value', dy)} class="svelte-t9i4r6"/></label></div> <div class="chart-container svelte-t9i4r6">`);

	LayerCake($$renderer, {
		padding: { top: 20, bottom: 10 },
		x: xKey,
		y: yKey,
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					AxisXTop($$renderer, {
						baseline,
						tickMarks,
						gridlines,
						snapLabels,
						tickMarkLength,
						tickGutter,
						dx,
						dy
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}