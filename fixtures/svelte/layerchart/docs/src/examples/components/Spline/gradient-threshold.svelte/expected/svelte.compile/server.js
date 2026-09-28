import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, LinearGradient, Spline } from 'layerchart';
import { getDailyTemperature } from '$lib/data.remote';

const data = await getDailyTemperature();

export default function Gradient_threshold($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { context }) {
				const thresholdOffset = context.yScale(50) / context.containerHeight * 100 + '%';

				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { gradient }) {
								Spline($$renderer, { class: 'stroke-2', stroke: gradient });
							}

							LinearGradient($$renderer, {
								stops: [
									[thresholdOffset, 'var(--color-info)'],
									[thresholdOffset, 'var(--color-danger)']
								],
								units: 'userSpaceOnUse',
								vertical: true,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yNice: true,
				padding: { top: 25, left: 16, bottom: 25 },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}