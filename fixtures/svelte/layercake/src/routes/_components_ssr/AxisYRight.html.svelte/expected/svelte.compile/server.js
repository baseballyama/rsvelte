import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import AxisYRight from '../../_components/AxisYRight.percent-range.html.svelte';
import data from '../../_data/points.csv';

export default function AxisYRight_html($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	let tickMarks = false;
	let snapBaselineLabel = false;
	let labelPosition = 'above';
	let gridlines = true;
	let tickMarkLength = undefined;
	let tickGutter = 5;
	let dx = 0;
	let dy = -3;
	const padding = { bottom: 15, right: 25 };

	$$renderer.push(`<div class="component-container svelte-1qpi6hm"><div class="props svelte-1qpi6hm"><label class="svelte-1qpi6hm"><input type="checkbox"${$.attr(
		'checked',
		// let alternate = false;
		// setInterval(() => {
		// 	alternate = !alternate;
		// }, 500);
		tickMarks,
		true
	)} class="svelte-1qpi6hm"/> tickMarks</label> <label class="svelte-1qpi6hm"><input type="checkbox"${$.attr('checked', gridlines, true)} class="svelte-1qpi6hm"/> gridlines</label> <label class="number svelte-1qpi6hm">labelPosition `);

	$$renderer.select({ value: labelPosition }, ($$renderer) => {
		$$renderer.option({ value: 'above' }, ($$renderer) => {
			$$renderer.push(`above`);
		});

		$$renderer.option({ value: 'even' }, ($$renderer) => {
			$$renderer.push(`even`);
		});
	});

	$$renderer.push(`</label> <label${$.attr_class('svelte-1qpi6hm', void 0, { 'disabled': labelPosition === 'above' })}><input type="checkbox"${$.attr('checked', snapBaselineLabel, true)}${$.attr('disabled', labelPosition === 'above', true)} class="svelte-1qpi6hm"/> <span${$.attr_class('svelte-1qpi6hm', void 0, { 'disabled': labelPosition === 'above' })}>snapBaselineLabel</span></label> <label${$.attr_class('number svelte-1qpi6hm', void 0, { 'disabled': !tickMarks })}><span${$.attr_class('svelte-1qpi6hm', void 0, { 'disabled': !tickMarks })}>tickMarkLength</span> <input type="number"${$.attr('value', tickMarkLength)}${$.attr('disabled', !tickMarks, true)} class="svelte-1qpi6hm"/></label> <label class="number svelte-1qpi6hm">tickGutter <input type="number"${$.attr('value', tickGutter)} class="svelte-1qpi6hm"/></label> <label class="number svelte-1qpi6hm">dx <input type="number"${$.attr('value', dx)} class="svelte-1qpi6hm"/></label> <label class="number svelte-1qpi6hm">dy <input type="number"${$.attr('value', dy)} class="svelte-1qpi6hm"/></label></div> <div class="chart-container svelte-1qpi6hm"><div class="mini-container">`);

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
					AxisYRight($$renderer, {
						tickMarks,
						snapBaselineLabel,
						labelPosition,
						gridlines,
						tickMarkLength,
						tickGutter,
						dx,
						dy,
						ticks: 4
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div>`);
}