import * as $ from 'svelte/internal/server';
import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

export default function Focal_location_and_radius_with_custom_colors($$renderer) {
	const radius = 50;

	Chart($$renderer, {
		height: 100,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { gradient }) {
							Circle($$renderer, { cx: radius + 0 * 120, cy: radius, r: radius, fill: gradient });
						}

						RadialGradient($$renderer, {
							stops: ['hsl(60 100% 50%)', 'hsl(30 100% 40%)'],
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Circle($$renderer, { cx: radius + 1 * 120, cy: radius, r: radius, fill: gradient });
						}

						RadialGradient($$renderer, {
							stops: ['hsl(60 100% 50%)', 'hsl(140 100% 40%)'],
							fx: '20%',
							fy: '20%',
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Circle($$renderer, { cx: radius + 2 * 120, cy: radius, r: radius, fill: gradient });
						}

						RadialGradient($$renderer, {
							stops: ['hsl(195 100% 50%)', 'hsl(270 100% 30%)'],
							r: '30%',
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}