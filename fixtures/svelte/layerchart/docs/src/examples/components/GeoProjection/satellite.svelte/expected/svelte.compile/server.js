import * as $ from 'svelte/internal/server';
import { geoSatellite } from 'd3-geo-projection';
import { merge } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { RangeField } from 'svelte-ux';
import { getUsStatesTopology } from '$lib/geo.remote';

const topology = await getUsStatesTopology();

export default function Satellite($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const land = merge(topology, topology.objects.states.geometries);
		let yaw = 76;
		let pitch = -34.5;
		let roll = 32.12;
		let distance = 1.1;
		let scale = 5500;
		let tilt = 25;
		const clipAngle = $.derived(() => Math.acos(1 / distance) * 180 / Math.PI - 1e-6);

		const projection = $.derived(() => () => {
			const p = geoSatellite().distance(distance).tilt(tilt).scale(scale).rotate([yaw, pitch, roll]).center([-2, 5]);

			p.clipAngle(clipAngle());

			return p;
		});

		const data = { topology };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_1fr_1fr] gap-3 mb-2">`);

			RangeField($$renderer, {
				label: 'Yaw',
				min: -180,
				max: 180,
				step: 1,
				get value() {
					return yaw;
				},

				set value($$value) {
					yaw = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Pitch',
				min: -90,
				max: 90,
				step: 1,
				get value() {
					return pitch;
				},

				set value($$value) {
					pitch = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Roll',
				min: -180,
				max: 180,
				step: 1,
				get value() {
					return roll;
				},

				set value($$value) {
					roll = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Distance',
				min: 1.01,
				max: 10,
				step: 0.01,
				get value() {
					return distance;
				},

				set value($$value) {
					distance = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Scale',
				min: 500,
				max: 20000,
				step: 100,
				get value() {
					return scale;
				},

				set value($$value) {
					scale = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Tilt',
				min: -90,
				max: 90,
				step: 1,
				get value() {
					return tilt;
				},

				set value($$value) {
					tilt = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				geo: { projection: projection() },
				padding: { top: 16, bottom: 16, left: 16, right: 16 },
				height: 600,
				clip: true,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'stroke-surface-content/30'
							});

							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/10' });
							$$renderer.push(`<!----> `);

							GeoPath($$renderer, {
								geojson: land,
								class: 'fill-surface-content/10 stroke-surface-content/30'
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