import * as $ from 'svelte/internal/server';
import { Axis, Chart, Frame, Layer } from 'layerchart';

export default function Border($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Frame($$renderer, { class: 'stroke-surface-content/50 fill-none' });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'bottom', rule: true });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left', rule: true });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}