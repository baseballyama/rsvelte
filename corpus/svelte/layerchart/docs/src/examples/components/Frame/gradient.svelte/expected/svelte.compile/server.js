import * as $ from 'svelte/internal/server';
import { Axis, Chart, Frame, Layer, LinearGradient } from 'layerchart';

export default function Gradient($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { gradient }) {
							Frame($$renderer, { class: 'stroke-primary/10', fill: gradient });
						}

						LinearGradient($$renderer, {
							class: 'from-primary/10 to-secondary/10',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'bottom' });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}