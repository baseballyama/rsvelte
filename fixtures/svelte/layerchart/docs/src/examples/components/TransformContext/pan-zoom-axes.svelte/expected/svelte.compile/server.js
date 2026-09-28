import * as $ from 'svelte/internal/server';
import { Chart, Layer, Axis, Rect, LinearGradient, ChartClipPath } from 'layerchart';
import { interpolateSpectral } from 'd3-scale-chromatic';
import { quantize } from 'd3-interpolate';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

export default function Pan_zoom_axes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const domainSize = 500;
		const stops = quantize((t) => interpolateSpectral(1 - t), 9);
		const data = [{ x: 0, y: 0 }, { x: domainSize, y: domainSize }];

		{
			function children($$renderer, { context }) {
				TransformControls($$renderer, {});
				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					children: ($$renderer) => {
						{
							function children($$renderer, { gradient }) {
								Rect($$renderer, {
									x: context.xScale(0),
									y: context.yScale(0),
									width: context.xScale(domainSize) - context.xScale(0),
									height: context.yScale(domainSize) - context.yScale(0),
									fill: gradient
								});
							}

							LinearGradient($$renderer, {
								x1: '0%',
								y1: '0%',
								x2: '100%',
								y2: '100%',
								stops,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'top',
							grid: { class: 'mix-blend-difference' },
							rule: false,
							tickMarks: false,
							tickLabelProps: { verticalAnchor: 'start', dy: 4, class: 'text-current' }
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'left',
							grid: { class: 'mix-blend-difference' },
							rule: false,
							tickMarks: false,
							tickLabelProps: { textAnchor: 'start', dx: 4, class: 'text-current' }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			Chart($$renderer, {
				data,
				x: 'x',
				y: 'y',
				xDomain: [0, domainSize],
				yDomain: [domainSize, 0],
				transform: {
					mode: 'domain',
					scaleExtent: [1, 40],
					motion: { type: 'spring' }
				},
				height: 500,
				clip: true,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}