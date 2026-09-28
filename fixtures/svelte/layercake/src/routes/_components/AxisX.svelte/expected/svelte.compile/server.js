import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import AxisX from '../../_components/AxisX.svelte';
import data from '../../_data/points.csv';

export default function AxisX_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	let tickMarks = false;
	let gridlines = true;
	let snapLabels = false;
	let baseline = true;
	let tickMarkLength = 6;
	let tickGutter = 0;
	let dx = 0;
	let dy = 12;

	$$renderer.push(`<div class="component-container svelte-13bb6qr"><div class="props svelte-13bb6qr"><label class="svelte-13bb6qr"><input type="checkbox"${$.attr('checked', tickMarks, true)} class="svelte-13bb6qr"/> tickMarks</label> <label class="svelte-13bb6qr"><input type="checkbox"${$.attr('checked', gridlines, true)} class="svelte-13bb6qr"/> gridlines</label> <label class="svelte-13bb6qr"><input type="checkbox"${$.attr('checked', baseline, true)} class="svelte-13bb6qr"/> baseline</label> <label class="svelte-13bb6qr"><input type="checkbox"${$.attr('checked', snapLabels, true)} class="svelte-13bb6qr"/> snapLabels</label> <label${$.attr_class('number svelte-13bb6qr', void 0, { 'disabled': !tickMarks })}><span${$.attr_class('svelte-13bb6qr', void 0, { 'disabled': !tickMarks })}>tickMarkLength</span> <input type="number"${$.attr('value', tickMarkLength)}${$.attr('disabled', !tickMarks, true)} class="svelte-13bb6qr"/></label> <label class="number svelte-13bb6qr">tickGutter <input type="number"${$.attr('value', tickGutter)} class="svelte-13bb6qr"/></label> <label class="number svelte-13bb6qr">dx <input type="number"${$.attr('value', dx)} class="svelte-13bb6qr"/></label> <label class="number svelte-13bb6qr">dy <input type="number"${$.attr('value', dy)} class="svelte-13bb6qr"/></label></div> <div class="chart-container svelte-13bb6qr">`);

	LayerCake($$renderer, {
		padding: { top: 10, bottom: 20 },
		x: xKey,
		y: yKey,
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
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

	$$renderer.push(`<!----></div></div>`);
}