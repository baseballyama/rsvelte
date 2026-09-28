import * as $ from 'svelte/internal/server';
import { Arc, Chart, Layer } from 'layerchart';

export default function Concentric($$renderer, $$props) {
	const data = {
		values: [
			{
				value: 400,
				domain: [0, 1000],
				fillClass: 'fill-red-500',
				trackClass: 'fill-red-500/10'
			},

			{
				value: 20,
				domain: [0, 30],
				fillClass: 'fill-lime-400',
				trackClass: 'fill-lime-400/10'
			},

			{
				value: 10,
				domain: [0, 12],
				fillClass: 'fill-cyan-400',
				trackClass: 'fill-cyan-500/10'
			}
		]
	};

	Chart($$renderer, {
		height: 200,
		padding: 20,
		children: ($$renderer) => {
			Layer($$renderer, {
				center: true,
				children: ($$renderer) => {
					Arc($$renderer, {
						value: 400,
						domain: [0, 1000],
						innerRadius: -20,
						cornerRadius: 10,
						class: 'fill-red-500',
						track: { class: 'fill-red-500/10' }
					});

					$$renderer.push(`<!----> `);

					Arc($$renderer, {
						value: 20,
						domain: [0, 30],
						outerRadius: -25,
						innerRadius: -20,
						cornerRadius: 10,
						class: 'fill-lime-400',
						track: { class: 'fill-lime-400/10' }
					});

					$$renderer.push(`<!----> `);

					Arc($$renderer, {
						value: 10,
						domain: [0, 12],
						outerRadius: -50,
						innerRadius: -20,
						cornerRadius: 10,
						class: 'fill-cyan-400',
						track: { class: 'fill-cyan-500/10' }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.bind_props($$props, { data });
}