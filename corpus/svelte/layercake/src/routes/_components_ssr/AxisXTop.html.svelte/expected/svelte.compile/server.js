import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import AxisXTop from '../../_components/AxisXTop.percent-range.html.svelte';
import data from '../../_data/points.csv';

export default function AxisXTop_html($$renderer) {
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
	let dy = 0;
	const padding = { top: 15, bottom: 10 };

	$$renderer.push(`<div class="component-container svelte-36sxra"><div class="props svelte-36sxra"><label class="svelte-36sxra"><input type="checkbox"${$.attr(
		'checked',
		// let alternate = false;
		// setInterval(() => {
		// 	alternate = !alternate;
		// }, 500);
		tickMarks,
		true
	)} class="svelte-36sxra"/> tickMarks</label> <label class="svelte-36sxra"><input type="checkbox"${$.attr('checked', gridlines, true)} class="svelte-36sxra"/> gridlines</label> <label class="svelte-36sxra"><input type="checkbox"${$.attr('checked', baseline, true)} class="svelte-36sxra"/> baseline</label> <label class="svelte-36sxra"><input type="checkbox"${$.attr('checked', snapLabels, true)} class="svelte-36sxra"/> snapLabels</label> <label${$.attr_class('number svelte-36sxra', void 0, { 'disabled': !tickMarks })}><span${$.attr_class('svelte-36sxra', void 0, { 'disabled': !tickMarks })}>tickMarkLength</span> <input type="number"${$.attr('value', tickMarkLength)}${$.attr('disabled', !tickMarks, true)} class="svelte-36sxra"/></label> <label class="number svelte-36sxra">tickGutter <input type="number"${$.attr('value', tickGutter)} class="svelte-36sxra"/></label> <label class="number svelte-36sxra">dx <input type="number"${$.attr('value', dx)} class="svelte-36sxra"/></label> <label class="number svelte-36sxra">dy <input type="number"${$.attr('value', dy)} class="svelte-36sxra"/></label></div> <div class="chart-container svelte-36sxra"><div class="mini-container" data-which="percent-range">`);

	LayerCake($$renderer, {
		ssr: true,
		percentRange: true,
		position: 'absolute',
		padding,
		x: xKey,
		y: (d) => d[yKey],
		data,
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					AxisXTop($$renderer, {
						baseline,
						tickMarks,
						snapLabels,
						gridlines,
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