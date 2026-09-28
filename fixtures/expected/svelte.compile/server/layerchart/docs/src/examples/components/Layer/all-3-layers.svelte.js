import * as $ from 'svelte/internal/server';
import { Chart, Layer, Circle, Arc } from 'layerchart';

export default function All_3_layers($$renderer) {
	Chart($$renderer, {
		height: 200,
		children: ($$renderer) => {
			Layer($$renderer, {
				center: true,
				type: 'canvas',
				children: ($$renderer) => {
					Circle($$renderer, { fill: '#F2D707', r: 100 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Layer($$renderer, {
				center: true,
				type: 'svg',
				children: ($$renderer) => {
					Circle($$renderer, { fill: 'black', r: 15, cx: -30, cy: -30 });
					$$renderer.push(`<!----> `);

					Arc($$renderer, {
						value: 100,
						range: [-260, -100],
						cornerRadius: 25,
						innerRadius: 50,
						outerRadius: 65,
						fill: 'black'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Layer($$renderer, {
				center: true,
				type: 'html',
				children: ($$renderer) => {
					Circle($$renderer, { id: 'left-eye', fill: 'black', r: 15, cx: 30, cy: -30 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}