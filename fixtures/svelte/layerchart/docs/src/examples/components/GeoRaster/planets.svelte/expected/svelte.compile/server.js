import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';
import { Button, ButtonGroup, Field, RangeField, SelectField } from 'svelte-ux';
import { TimerState } from '@layerstack/svelte-state';

export default function Planets($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Equirectangular planetary surface maps sourced from Solar System Scope
		// (https://www.solarsystemscope.com/textures) — CC BY 4.0.
		const planets = [
			{ label: 'Mercury', value: '/images/planets/mercury.jpg' },
			{ label: 'Venus', value: '/images/planets/venus_surface.jpg' },
			{ label: 'Earth', value: '/images/blue-marble.jpg' },
			{ label: 'Moon', value: '/images/planets/moon.jpg' },
			{ label: 'Mars', value: '/images/planets/mars.jpg' },
			{ label: 'Jupiter', value: '/images/planets/jupiter.jpg' },
			{ label: 'Saturn', value: '/images/planets/saturn.jpg' },
			{ label: 'Uranus', value: '/images/planets/uranus.jpg' },
			{ label: 'Neptune', value: '/images/planets/neptune.jpg' }
		];

		let planet = planets.find((p) => p.label === 'Jupiter').value;
		let context = void 0;
		let velocity = 3;

		const timer = new TimerState({
			delay: 1,
			tick: () => {
				if (!context) return;

				const curr = context.transform.translate;

				context.transform.translate = { x: curr.x += velocity, y: curr.y };
			},
			disabled: true
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-4 items-center mb-4 screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'Planet',
				options: planets,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				classes: { root: 'w-60' },
				get value() {
					return planet;
				},

				set value($$value) {
					planet = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Spin:',
				dense: true,
				labelPlacement: 'left',
				children: ($$renderer) => {
					ButtonGroup($$renderer, {
						size: 'sm',
						variant: 'fill-light',
						children: ($$renderer) => {
							Button($$renderer, {
								disabled: timer.running,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Start`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								disabled: !timer.running,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Stop`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Velocity:',
				min: -10,
				max: 10,
				disabled: !timer.running,
				labelPlacement: 'left',
				class: 'flex-1',
				get value() {
					return velocity;
				},

				set value($$value) {
					velocity = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				geo: { projection: geoOrthographic, fitGeojson: { type: 'Sphere' } },
				transform: {
					mode: 'projection',
					constrain: ({ scale, translate }) => ({
						scale,
						translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
					})
				},
				ondragstart: timer.stop,
				padding: { top: 10, bottom: 10, left: 10, right: 10 },
				height: 500,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Layer($$renderer, {
						type: 'canvas',
						children: ($$renderer) => {
							GeoRaster($$renderer, { image: planet, interpolate: 'bilinear' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						type: 'svg',
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'fill-none stroke-surface-content/30'
							});

							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/10' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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
	});
}