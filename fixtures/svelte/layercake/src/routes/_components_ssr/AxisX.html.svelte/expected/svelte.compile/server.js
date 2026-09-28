import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import data from '../../_data/points.csv';

export default function AxisX_html($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	let tickMarks = false;
	let snapLabels = false;
	let baseline = true;
	let gridlines = true;
	let tickMarkLength = 6;
	let tickGutter = 0;
	let dx = 0;
	let dy = 1;
	const padding = { top: 10, bottom: 20 };

	$$renderer.push(`<div class="component-container svelte-1egi245"><div class="props svelte-1egi245"><label class="svelte-1egi245"><input type="checkbox"${$.attr(
		'checked',
		// let alternate = false;
		// setInterval(() => {
		// 	alternate = !alternate;
		// }, 500);
		tickMarks,
		true
	)} class="svelte-1egi245"/> tickMarks</label> <label class="svelte-1egi245"><input type="checkbox"${$.attr('checked', gridlines, true)} class="svelte-1egi245"/> gridlines</label> <label class="svelte-1egi245"><input type="checkbox"${$.attr('checked', baseline, true)} class="svelte-1egi245"/> baseline</label> <label class="svelte-1egi245"><input type="checkbox"${$.attr('checked', snapLabels, true)} class="svelte-1egi245"/> snapLabels</label> <label${$.attr_class('number svelte-1egi245', void 0, { 'disabled': !tickMarks })}><span${$.attr_class('svelte-1egi245', void 0, { 'disabled': !tickMarks })}>tickMarkLength</span> <input type="number"${$.attr('value', tickMarkLength)}${$.attr('disabled', !tickMarks, true)} class="svelte-1egi245"/></label> <label class="number svelte-1egi245">tickGutter <input type="number"${$.attr('value', tickGutter)} class="svelte-1egi245"/></label> <label class="number svelte-1egi245">dx <input type="number"${$.attr('value', dx)} class="svelte-1egi245"/></label> <label class="number svelte-1egi245">dy <input type="number"${$.attr('value', dy)} class="svelte-1egi245"/></label></div> <div class="chart-container svelte-1egi245"><div class="mini-container">`);

	LayerCake($$renderer, {
		position: 'absolute',
		ssr: true,
		percentRange: true,
		padding,
		x: xKey,
		y: (d) => d[yKey],
		yDomain: [0, null],
		data,
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					AxisX($$renderer, {
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

	$$renderer.push(`<!----></div></div></div>`);
}