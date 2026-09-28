import * as $ from 'svelte/internal/server';
import { Canvas, Layer } from '$lib';
import { geoOrthographic, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import land from 'world-atlas/land-110m.json';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const map = feature(land, 'land');
		let width = void 0;
		const pad = $.derived(() => width * 0.02);
		const projection = $.derived(() => geoOrthographic().fitExtent([[pad(), pad()], [width - pad(), width - pad()]], { type: 'Sphere' }));
		const path = $.derived(() => geoPath(projection()));

		Canvas($$renderer, {
			autoplay: true,
			onresize: (e) => width = e.width,
			children: ($$renderer) => {
				Layer($$renderer, {
					render: ({ context, time }) => {
						path().context(context);
						projection().rotate([time / 50, -10]);
						context.strokeStyle = '#ccc';
						context.beginPath();
						path()(geoGraticule10());
						context.stroke();
					}
				});

				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					render: ({ context }) => {
						context.fillStyle = 'tomato';
						context.beginPath();
						path()(map);
						context.fill();
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}