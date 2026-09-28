import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import TextTruncateControls from '$lib/components/controls/TextTruncateControls.svelte';
import { schemeTableau10 } from 'd3-scale-chromatic';

export default function Truncate_axis_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ value: 47, label: 'This is 1st really long text' },
			{ value: 27, label: 'This is 2nd really long text' },
			{ value: 82, label: 'This is 3rd really long text' }
		];

		let position = 'end';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TextTruncateControls($$renderer, {
				get position() {
					return position;
				},

				set position($$value) {
					position = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			BarChart($$renderer, {
				data,
				x: 'value',
				y: 'label',
				labels: { placement: 'inside' },
				cRange: schemeTableau10,
				orientation: 'horizontal',
				props: {
					yAxis: {
						tickLabelProps: { truncate: { maxChars: 19, ellipsis: '...', position } }
					}
				},
				padding: defaultChartPadding({ top: 20, left: 90 }),
				height: 300
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}