import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { curveCatmullRomClosed } from 'd3-shape';
import { feature } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import GeoPathGlobeControls2 from '$lib/components/controls/GeoPathGlobeControls2.svelte';
import { TimerState } from '@layerstack/svelte-state';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Sketchy_globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let curve = curveCatmullRomClosed;
		let minArea = 2;
		let context = null;
		let velocity = 1;
		const simplifiedGeojson = $.derived(() => simplify(presimplify(topology), Math.pow(10, 2 - minArea)));
		const land = $.derived(() => feature(simplifiedGeojson(), topology.objects.land));

		const timer = new TimerState({
			delay: 1,
			tick: () => {
				if (!context) return;

				const curr = context.transform.translate;

				context.transform.translate = { x: curr.x += velocity, y: curr.y };
			},
			disabled: true
		});

		const data = { topology, land: land() };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GeoPathGlobeControls2($$renderer, {
				timer,
				get curve() {
					return curve;
				},

				set curve($$value) {
					curve = $$value;
					$$settled = false;
				},

				get minArea() {
					return minArea;
				},

				set minArea($$value) {
					minArea = $$value;
					$$settled = false;
				},

				get velocity() {
					return velocity;
				},

				set velocity($$value) {
					velocity = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				geo: { projection: geoOrthographic, fitGeojson: land() },
				transform: { mode: 'projection' },
				ondragstart: timer.stop,
				padding: { top: 5, bottom: 5, left: 5, right: 5 },
				height: 600,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });
							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/20' });
							$$renderer.push(`<!----> `);

							GeoPath($$renderer, {
								geojson: land(),
								curve,
								class: 'stroke-surface-content/50 fill-white'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}