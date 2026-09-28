import 'svelte/internal/disclose-version';
import { getDailyTemperatures } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { scaleUtc } from 'd3-scale';
import { curveCatmullRom } from 'd3-shape';
import { Axis, Chart, Layer, Spline } from 'layerchart';

const data = await getDailyTemperatures();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Radial_multi_year_lines($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Spline(node, {
						get curve() {
							return curveCatmullRom;
						},

						class: (d) => d.year === 2024
							? 'stroke-primary'
							: d.year === 2023 ? 'stroke-primary/50' : 'stroke-surface-content',
						opacity: (d) => [2023, 2024].includes(d.year) ? 1 : context().zScale(d.year)
					});

					var node_1 = $.sibling(node, 2);

					Axis(node_1, {
						placement: 'angle',
						tickLength: 0,
						grid: true,
						format: 'month'
					});

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, {
						placement: 'radius',
						grid: true,
						rule: { y: '$top', class: 'stroke-surface-content/20' },
						ticks: 4,
						format: (v) => v + '° F'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(scaleUtc);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get xScale() {
				return $.get($0);
			},
			y: 'value',
			yRange: ({ height }) => [height / 5, height / 2],
			yPadding: [0, 20],
			z: 'year',
			zDomain: [1940, 2024],
			zRange: [0.1, 0.2],
			radial: true,
			padding: { top: 12, bottom: 12 },
			height: 500,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}