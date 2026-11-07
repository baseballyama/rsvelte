import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/points.csv';

export default function AxisY_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	let tickMarks = false;
	let snapBaselineLabel = false;
	let gridlines = true;
	let labelPosition = 'above';
	let tickMarkLength = undefined;
	let tickGutter = 0;
	let dx = 0;
	let dy = 0;

	$$renderer.push(`<div class="component-container svelte-uev1ls"><div class="props svelte-uev1ls"><label class="svelte-uev1ls"><input type="checkbox"${$.attr('checked', tickMarks, true)} class="svelte-uev1ls"/> tickMarks</label> <label class="svelte-uev1ls"><input type="checkbox"${$.attr('checked', gridlines, true)} class="svelte-uev1ls"/> gridlines</label> <label class="number svelte-uev1ls">labelPosition `);

	$$renderer.select({ value: labelPosition }, ($$renderer) => {
		$$renderer.option({ value: 'above' }, ($$renderer) => {
			$$renderer.push(`above`);
		});

		$$renderer.option({ value: 'even' }, ($$renderer) => {
			$$renderer.push(`even`);
		});
	});

	$$renderer.push(`</label> <label${$.attr_class('svelte-uev1ls', void 0, { 'disabled': labelPosition === 'above' })}><input type="checkbox"${$.attr('checked', snapBaselineLabel, true)}${$.attr('disabled', labelPosition === 'above', true)} class="svelte-uev1ls"/> <span${$.attr_class('svelte-uev1ls', void 0, { 'disabled': labelPosition === 'above' })}>snapBaselineLabel</span></label> <label${$.attr_class('number svelte-uev1ls', void 0, { 'disabled': !tickMarks })}><span${$.attr_class('svelte-uev1ls', void 0, { 'disabled': !tickMarks })}>tickMarkLength</span> <input type="number"${$.attr('value', tickMarkLength)}${$.attr('disabled', !tickMarks, true)} class="svelte-uev1ls"/></label> <label class="number svelte-uev1ls">tickGutter <input type="number"${$.attr('value', tickGutter)} class="svelte-uev1ls"/></label> <label class="number svelte-uev1ls">dx <input type="number"${$.attr('value', dx)} class="svelte-uev1ls"/></label> <label class="number svelte-uev1ls">dy <input type="number"${$.attr('value', dy)} class="svelte-uev1ls"/></label></div> <div class="chart-container svelte-uev1ls">`);

	LayerCake($$renderer, {
		padding: { bottom: 15, left: 10 },
		x: xKey,
		y: yKey,
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					AxisY($$renderer, {
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

	$$renderer.push(`<!----></div></div>`);
}