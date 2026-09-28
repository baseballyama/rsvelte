import * as $ from 'svelte/internal/server';
import { scaleUtc } from 'd3-scale';
import { curveCatmullRom, curveCatmullRomClosed } from 'd3-shape';
import { Area, Axis, Chart, Layer, Spline } from 'layerchart';
import { getSfoTemperatures } from '$lib/data.remote';

const data = await getSfoTemperatures();

export default function Radial_line_with_areas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			data,
			x: 'date',
			xScale: scaleUtc(),
			y: ['minmin', 'maxmax'],
			yRange: ({ height }) => [height / 5, height / 2],
			radial: true,
			padding: { top: 12, bottom: 12 },
			height: 500,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Spline($$renderer, {
							y: (d) => d.avg,
							curve: curveCatmullRom,
							class: 'stroke-primary'
						});

						$$renderer.push(`<!----> `);

						Area($$renderer, {
							y0: (d) => d.min,
							y1: (d) => d.max,
							curve: curveCatmullRomClosed,
							class: 'fill-primary/20'
						});

						$$renderer.push(`<!----> `);

						Area($$renderer, {
							y0: (d) => d.minmin,
							y1: (d) => d.maxmax,
							curve: curveCatmullRomClosed,
							class: 'fill-primary/20'
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'angle',
							grid: true,
							tickLength: 0,
							format: 'month'
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'radius',
							rule: { y: '$top', class: 'stroke-surface-content/20' },
							grid: true,
							format: (v) => v + '° F'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}