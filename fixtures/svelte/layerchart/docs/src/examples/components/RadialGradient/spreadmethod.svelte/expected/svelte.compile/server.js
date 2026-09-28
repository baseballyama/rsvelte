import * as $ from 'svelte/internal/server';
import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

export default function Spreadmethod($$renderer) {
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
							class: 'from-green-500 to-blue-500',
							r: '30%',
							spreadMethod: 'pad',
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
							class: 'from-green-500 to-blue-500',
							r: '30%',
							spreadMethod: 'reflect',
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
							class: 'from-green-500 to-blue-500',
							r: '30%',
							spreadMethod: 'repeat',
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