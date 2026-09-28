import * as $ from 'svelte/internal/server';
import { scaleDiverging, scaleLog } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import { format } from '@layerstack/utils';
import { Axis, Chart, Layer, Legend, Link, Text } from 'layerchart';
import { getMetros } from '$lib/data.remote';

const data = await getMetros();

export default function Bended_arrows($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Inequality change from 1980 → 2015 — positive means more unequal.
		// Reverse RdBu so red = increased inequality, blue = decreased.
		const colorScale = scaleDiverging([-4, 0, 4], (t) => interpolateRdBu(1 - t));

		const highlighted = data.filter((d) => d.highlight === 1);

		$$renderer.push(`<div class="flex justify-end mb-2">`);

		Legend($$renderer, {
			scale: colorScale,
			title: 'Change in inequality from 1980 to 2015',
			tickFormat: (v) => v > 0 ? `+${v}` : `${v}`,
			class: 'max-w-sm'
		});

		$$renderer.push(`<!----></div> `);

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							grid: true,
							label: 'Population',
							format: (v) => {
								const mag = Math.pow(10, Math.floor(Math.log10(v)));

								return v / mag <= 4 ? format(v, 'metric') : '';
							}
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'left',
							grid: true,
							label: 'Inequality (90/10 ratio)'
						});

						$$renderer.push(`<!----> `);

						Link($$renderer, {
							x1: 'POP_1980',
							y1: 'R90_10_1980',
							x2: 'POP_2015',
							y2: 'R90_10_2015',
							type: 'swoop',
							bend: 22.5,
							markerEnd: 'arrow',
							strokeWidth: 1.5,
							class: (d) => context.tooltip.data == null
								? ''
								: context.tooltip.data.Metro === d.Metro ? 'stroke-2' : 'opacity-10'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							data: context.tooltip.data ? [context.tooltip.data] : highlighted,
							x: 'POP_2015',
							y: 'R90_10_2015',
							value: 'nyt_display',
							textAnchor: 'middle',
							dy: -8,
							class: 'text-xs text-current stroke-2 stroke-surface-100 font-semibold pointer-events-none'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: ['POP_1980', 'POP_2015'],
				y: ['R90_10_1980', 'R90_10_2015'],
				xScale: scaleLog(),
				c: (d) => d.R90_10_2015 - d.R90_10_1980,
				cScale: colorScale,
				cDomain: [-4, 0, 4],
				xPadding: [10, 30],
				yPadding: [10, 20],
				padding: { top: 20, right: 20, bottom: 32, left: 40 },
				tooltipContext: { mode: 'quadtree', x: 'POP_2015', y: 'R90_10_2015' },
				height: 500,
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { data });
	});
}