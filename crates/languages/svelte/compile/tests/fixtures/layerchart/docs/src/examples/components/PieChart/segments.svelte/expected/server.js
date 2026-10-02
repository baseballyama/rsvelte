import * as $ from 'svelte/internal/server';
import { PieChart, Text } from 'layerchart';
import { Spring } from 'svelte/motion';
import PieChartControls from '$lib/components/controls/PieChartControls.svelte';

export default function Segments($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 60;
		let value = new Spring(75);

		let data = $.derived(() => Array.from({ length: count }, (_, i) => {
			return {
				key: i + 1,
				value: 1,
				color: i / count * 100 < (value.current ?? 0)
					? 'var(--color-success)'
					: 'color-mix(in lch, var(--color-surface-content) 10%, transparent)'
			};
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			PieChartControls($$renderer, {
				get count() {
					return count;
				},

				set count($$value) {
					count = $$value;
					$$settled = false;
				},

				get value() {
					return value.target;
				},

				set value($$value) {
					value.target = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function aboveMarks($$renderer) {
					Text($$renderer, {
						value: Math.round(value.current ?? 0),
						textAnchor: 'middle',
						verticalAnchor: 'middle',
						dy: 16,
						class: 'text-6xl tabular-nums'
					});
				}

				PieChart($$renderer, {
					data: data(),
					key: 'key',
					value: 'value',
					c: 'color',
					innerRadius: -20,
					cornerRadius: 4,
					padAngle: 0.02,
					tooltipContext: false,
					height: 300,
					aboveMarks,
					$$slots: { aboveMarks: true }
				});
			}

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