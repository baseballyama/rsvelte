import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg, Html, takeEvery } from 'layercake';
import { extent, bin } from 'd3-array';
import { scaleBand } from 'd3-scale';
import { format } from 'd3-format';
import Column from '../../_components/Column.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import calcThresholds from '../../_modules/calcThresholds.js';
import data from '../../_data/unemployment.js';

export default function Histogram($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const f = format('.2f');
		let binCount = 40;
		const xKey = ['x0', 'x1'];
		const yKey = 'length';
		const domain = extent(data);
		let steps = $.derived(() => calcThresholds(domain, binCount));
		let hist = $.derived(() => bin().domain(domain).thresholds(steps()));
		let slimSteps = $.derived(() => takeEvery(steps(), 7));

		$$renderer.push(`<div class="input-container" style="position: absolute;right:10px;z-index: 9;"><input style="margin:0;" type="range" min="4" max="100" step="4"${$.attr('value', binCount)} class="svelte-5bi4uq"/> <span class="counter-container" style="display:inline-block;vertical-align:top;width: 70px;text-align:right;">${$.escape(binCount)} bins</span></div> <div class="chart-container svelte-5bi4uq">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: { top: 20, right: 5, bottom: 20, left: 31 },
			x: xKey,
			y: yKey,
			xDomain: steps(),
			xScale: scaleBand().paddingInner(0),
			yDomain: [0, null],
			data: hist()(data),
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, {
							gridlines: false,
							baseline: true,
							ticks: slimSteps(),
							format: (d) => String(+f(d))
						});

						$$renderer.push(`<!----> `);
						AxisY($$renderer, { gridlines: false, ticks: 3 });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ScaledSvg($$renderer, {
					children: ($$renderer) => {
						Column($$renderer, { fill: '#fff', stroke: '#000', strokeWidth: 1 });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}