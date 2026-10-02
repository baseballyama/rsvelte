import 'svelte/internal/disclose-version';
import { getSfoTemperatures } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { scaleUtc } from 'd3-scale';
import { curveCatmullRom, curveCatmullRomClosed } from 'd3-shape';
import { Area, Axis, Chart, Layer, Spline } from 'layerchart';

const data = await getSfoTemperatures();
var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Radial_line_with_areas($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		let $0 = $.derived(scaleUtc);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get xScale() {
				return $.get($0);
			},
			y: ['minmin', 'maxmax'],
			yRange: ({ height }) => [height / 5, height / 2],
			radial: true,
			padding: { top: 12, bottom: 12 },
			height: 500,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					center: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Spline(node, {
							y: (d) => d.avg,
							get curve() {
								return curveCatmullRom;
							},
							class: 'stroke-primary'
						});

						var node_1 = $.sibling(node, 2);

						Area(node_1, {
							y0: (d) => d.min,
							y1: (d) => d.max,
							get curve() {
								return curveCatmullRomClosed;
							},
							class: 'fill-primary/20'
						});

						var node_2 = $.sibling(node_1, 2);

						Area(node_2, {
							y0: (d) => d.minmin,
							y1: (d) => d.maxmax,
							get curve() {
								return curveCatmullRomClosed;
							},
							class: 'fill-primary/20'
						});

						var node_3 = $.sibling(node_2, 2);

						Axis(node_3, {
							placement: 'angle',
							grid: true,
							tickLength: 0,
							format: 'month'
						});

						var node_4 = $.sibling(node_3, 2);

						Axis(node_4, {
							placement: 'radius',
							rule: { y: '$top', class: 'stroke-surface-content/20' },
							grid: true,
							format: (v) => v + '° F'
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}