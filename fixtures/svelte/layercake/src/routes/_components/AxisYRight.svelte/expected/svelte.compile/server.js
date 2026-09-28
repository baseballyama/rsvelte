import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import AxisYRight from '../../_components/AxisYRight.svelte';
import data from '../../_data/points.csv';

export default function AxisYRight_1($$renderer) {
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
	let dy = 0;

	$$renderer.push(`<div class="component-container svelte-14kdliq"><div class="props svelte-14kdliq"><label class="svelte-14kdliq"><input type="checkbox"${$.attr('checked', tickMarks, true)} class="svelte-14kdliq"/> tickMarks</label> <label class="svelte-14kdliq"><input type="checkbox"${$.attr('checked', gridlines, true)} class="svelte-14kdliq"/> gridlines</label> <label class="number svelte-14kdliq">labelPosition `);

	$$renderer.select({ value: labelPosition }, ($$renderer) => {
		$$renderer.option({ value: 'above' }, ($$renderer) => {
			$$renderer.push(`above`);
		});

		$$renderer.option({ value: 'even' }, ($$renderer) => {
			$$renderer.push(`even`);
		});
	});

	$$renderer.push(`</label> <label${$.attr_class('svelte-14kdliq', void 0, { 'disabled': labelPosition === 'above' })}><input type="checkbox"${$.attr('checked', snapBaselineLabel, true)}${$.attr('disabled', labelPosition === 'above', true)} class="svelte-14kdliq"/> <span${$.attr_class('svelte-14kdliq', void 0, { 'disabled': labelPosition === 'above' })}>snapBaselineLabel</span></label> <label${$.attr_class('number svelte-14kdliq', void 0, { 'disabled': !tickMarks })}><span${$.attr_class('svelte-14kdliq', void 0, { 'disabled': !tickMarks })}>tickMarkLength</span> <input type="number"${$.attr('value', tickMarkLength)}${$.attr('disabled', !tickMarks, true)} class="svelte-14kdliq"/></label> <label class="number svelte-14kdliq">tickGutter <input type="number"${$.attr('value', tickGutter)} class="svelte-14kdliq"/></label> <label class="number svelte-14kdliq">dx <input type="number"${$.attr('value', dx)} class="svelte-14kdliq"/></label> <label class="number svelte-14kdliq">dy <input type="number"${$.attr('value', dy)} class="svelte-14kdliq"/></label></div> <div class="chart-container svelte-14kdliq">`);

	LayerCake($$renderer, {
		padding: { bottom: 15, right: 25 },
		x: xKey,
		y: yKey,
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					AxisYRight($$renderer, {
						tickMarks,
						labelPosition,
						snapBaselineLabel,
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