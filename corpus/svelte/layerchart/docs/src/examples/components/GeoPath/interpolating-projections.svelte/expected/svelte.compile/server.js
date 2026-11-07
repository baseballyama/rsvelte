import * as $ from 'svelte/internal/server';
import { cubicInOut } from 'svelte/easing';

import {
	geoProjection,
	geoEquirectangularRaw,
	geoMercatorRaw,
	geoNaturalEarth1Raw,
	geoEqualEarthRaw,
	geoOrthographicRaw,
	geoStereographicRaw,
	geoGnomonicRaw
} from 'd3-geo';

import {
	geoAitoffRaw,
	geoAugustRaw,
	geoBakerRaw,
	geoBoggsRaw,
	geoBromleyRaw,
	geoCollignonRaw,
	geoCrasterRaw,
	geoEckert1Raw,
	geoEckert3Raw,
	geoEckert5Raw,
	geoFaheyRaw,
	geoKavrayskiy7Raw,
	geoLarriveeRaw,
	geoMillerRaw,
	geoNaturalEarth2Raw,
	geoPattersonRaw,
	geoRobinsonRaw,
	geoSinusoidalRaw,
	geoTimesRaw,
	geoVanDerGrintenRaw,
	geoWiechelRaw,
	geoWinkel3Raw
} from 'd3-geo-projection';

import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { Button, ButtonGroup, Field, RangeField, SelectField, Switch } from 'svelte-ux';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Interpolating_projections($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const land = feature(topology, topology.objects.land);

		const projections = [
			{ label: 'Aitoff', value: geoAitoffRaw },
			{ label: 'August', value: geoAugustRaw },
			{ label: 'Baker', value: geoBakerRaw },
			{ label: 'Boggs', value: geoBoggsRaw },
			{ label: 'Bromley', value: geoBromleyRaw },
			{ label: 'Collignon', value: geoCollignonRaw },
			{ label: 'Craster', value: geoCrasterRaw },
			{ label: 'Eckert I', value: geoEckert1Raw },
			{ label: 'Eckert III', value: geoEckert3Raw },
			{ label: 'Eckert V', value: geoEckert5Raw },
			{ label: 'Equal Earth', value: geoEqualEarthRaw },
			{ label: 'Equirectangular', value: geoEquirectangularRaw },
			{ label: 'Fahey', value: geoFaheyRaw },
			{ label: 'Gnomonic', value: geoGnomonicRaw },
			{ label: 'Kavrayskiy VII', value: geoKavrayskiy7Raw },
			{ label: 'Larrivee', value: geoLarriveeRaw },
			{ label: 'Mercator', value: geoMercatorRaw },
			{ label: 'Miller', value: geoMillerRaw },
			{ label: 'Natural Earth 1', value: geoNaturalEarth1Raw },
			{ label: 'Natural Earth 2', value: geoNaturalEarth2Raw },
			{ label: 'Orthographic', value: geoOrthographicRaw },
			{ label: 'Patterson', value: geoPattersonRaw },
			{ label: 'Robinson', value: geoRobinsonRaw },
			{ label: 'Sinusoidal', value: geoSinusoidalRaw },
			{ label: 'Stereographic', value: geoStereographicRaw },
			{ label: 'Times', value: geoTimesRaw },
			{ label: 'Van der Grinten', value: geoVanDerGrintenRaw },
			{ label: 'Wiechel', value: geoWiechelRaw },
			{ label: 'Winkel Tripel', value: geoWinkel3Raw }
		];

		const FRAMES = 480;
		let rawFrom = geoMercatorRaw;
		let rawTo = geoOrthographicRaw;
		let showGraticule = true;
		let animating = true;
		let currentFrame = 0;
		let manualT = 0;
		let scale = 150;

		// Ping-pong easing: 0 -> 1 -> 0 over 2*FRAMES
		const animatedT = $.derived(() => {
			const frame = currentFrame % (FRAMES * 2);
			const phase = frame < FRAMES ? frame / FRAMES : 2 - frame / FRAMES;

			return cubicInOut(phase);
		});

		const t = $.derived(() => animating ? animatedT() : manualT);

		// Interpolated projection factory -- recreated each frame as t updates
		const projectionFactory = $.derived(() => {
			const currentT = t();
			const r0 = rawFrom;
			const r1 = rawTo;

			return () => {
				const raw = (lambda, phi) => {
					const [x0, y0] = r0(lambda, phi);
					const [x1, y1] = r1(lambda, phi);

					return [x0 + currentT * (x1 - x0), y0 + currentT * (y1 - y0)];
				};

				return geoProjection(raw).precision(0.1);
			};
		});

		// Animation loop
		const data = { topology };

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_1fr] gap-2 mb-4 screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'From',
				options: projections,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				get value() {
					return rawFrom;
				},

				set value($$value) {
					rawFrom = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SelectField($$renderer, {
				label: 'To',
				options: projections,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				get value() {
					return rawTo;
				},

				set value($$value) {
					rawTo = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="flex gap-4 items-center mb-4 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Graticule',
				dense: true,
				labelPlacement: 'left',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return showGraticule;
							},

							set checked($$value) {
								showGraticule = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				size: 'sm',
				variant: 'fill-light',
				children: ($$renderer) => {
					Button($$renderer, {
						disabled: animating,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Play`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						disabled: !animating,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Pause`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Blend',
				min: 0,
				max: 1,
				step: 0.001,
				disabled: animating,
				class: 'flex-1',
				get value() {
					return manualT;
				},

				set value($$value) {
					manualT = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Scale',
				min: 10,
				max: 500,
				step: 1,
				class: 'flex-1',
				get value() {
					return scale;
				},

				set value($$value) {
					scale = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				geo: { projection: projectionFactory(), scale },
				height: 800,
				clip: true,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'stroke-surface-content/20 fill-none'
							});

							$$renderer.push(`<!----> `);

							if (showGraticule) {
								$$renderer.push('<!--[0-->');
								Graticule($$renderer, { class: 'stroke-surface-content/10' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);
							GeoPath($$renderer, { geojson: land, class: 'fill-surface-content/15' });
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