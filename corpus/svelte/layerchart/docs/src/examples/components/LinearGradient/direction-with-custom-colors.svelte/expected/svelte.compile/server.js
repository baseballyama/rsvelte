import * as $ from 'svelte/internal/server';
import { Chart, Layer, LinearGradient, Rect } from 'layerchart';

export default function Direction_with_custom_colors($$renderer) {
	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 0,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							stops: ['hsl(60 100% 50%)', 'hsl(30 100% 40%)'],
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 1,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							stops: ['hsl(60 100% 50%)', 'hsl(140 100% 40%)'],
							rotate: 45,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { gradient }) {
							Rect($$renderer, {
								x: 120 * 2,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								fill: gradient
							});
						}

						LinearGradient($$renderer, {
							stops: ['hsl(195 100% 50%)', 'hsl(270 100% 30%)'],
							vertical: true,
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