import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, bin, takeEvery } from 'layercake';
import { extent } from 'd3-array';
import { scaleBand } from 'd3-scale';
import { format } from 'd3-format';
import Column from '../../_components/Column.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import calcThresholds from '../../_modules/calcThresholds.js';
import data from '../../_data/unemployment.js';

export default function Histogram($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const f = format('.2f');
		const xKey = ['x0', 'x1'];
		const yKey = 'length';
		let binCount = 40;
		const domain = extent(data);
		let thresholds = $.derived(() => calcThresholds(domain, binCount));
		let slimThresholds = $.derived(() => takeEvery(thresholds(), 5));
		let binnedData = $.derived(() => bin(data, (d) => d, { domain, thresholds: thresholds() }));

		$$renderer.push(`<div class="input-container" style="position: absolute;right:10px;z-index: 9;"><input style="margin:0;" type="range" min="4" max="100" step="4"${$.attr('value', binCount)} class="svelte-tflt1t"/> <span class="counter-container" style="display:inline-block;vertical-align:top;width: 70px;text-align:right;">${$.escape(binCount)} bins</span></div> <div class="chart-container svelte-tflt1t">`);

		LayerCake($$renderer, {
			padding: { top: 20, right: 5, bottom: 20, left: 30 },
			x: xKey,
			y: yKey,
			xDomain: thresholds(),
			xScale: scaleBand().paddingInner(0),
			yDomain: [0, null],
			data: binnedData(),
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, {
							gridlines: false,
							baseline: true,
							ticks: slimThresholds(),
							format: (d) => String(+f(d))
						});

						$$renderer.push(`<!----> `);
						AxisY($$renderer, { gridlines: false, ticks: 3 });
						$$renderer.push(`<!----> `);
						Column($$renderer, { fill: '#fff', stroke: '#000', strokeWidth: 1 });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}