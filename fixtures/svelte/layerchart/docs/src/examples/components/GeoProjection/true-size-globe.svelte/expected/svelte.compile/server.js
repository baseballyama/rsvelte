import * as $ from 'svelte/internal/server';

import {
	geoOrthographic,
	geoAzimuthalEqualArea,
	geoCentroid,
	geoBounds,
	geoDistance
} from 'd3-geo';

import { cubicInOut } from 'svelte/easing';
import { feature } from 'topojson-client';
import { Chart, Layer, Rect } from 'layerchart';
import { GeoPath, GeoProjection, Graticule } from 'layerchart/geo';
import { SelectField } from 'svelte-ux';
import { getCountriesTopology } from '$lib/geo.remote';

const countriesTopo = await getCountriesTopology();

export default function True_size_globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(countriesTopo, countriesTopo.objects.countries);

		// Chart contexts for tweened transforms
		let contextA = void 0;

		let contextB = void 0;
		let comparisonContext = void 0;

		// Derived rotation from each chart's transform (for comparison view + viewport rects)
		const rotateA = $.derived(() => contextA?.transform
			? [
				contextA.transform.translate.x,
				contextA.transform.translate.y,
				0
			]
			: [-20, 0, 0]);

		const rotateB = $.derived(() => contextB?.transform
			? [
				contextB.transform.translate.x,
				contextB.transform.translate.y,
				0
			]
			: [100, -40, 0]);

		// Comparison zoom — driven by the comparison Chart's transform scale
		const comparisonZoom = $.derived(() => comparisonContext?.transform?.scale ?? 3);

		const zoomMin = 1.5;
		const zoomMax = 12;

		// Track comparison chart dimensions for viewport indicator rectangle
		let comparisonContainerW = 432;

		let comparisonContainerH = 432;

		// Compute viewport indicator rect size in pixels on a globe chart.
		// Azimuthal equal-area: pixel offset d → angular distance θ = 2*asin(d/(2*scale))
		// Orthographic: angular distance θ → pixel offset r = globeRadius * sin(θ)
		function viewportRectSize(globeRadius) {
			if (!globeRadius || !comparisonZoom()) return { w: 0, h: 0 };

			const compScale = Math.min(comparisonContainerW, comparisonContainerH) / 2 * comparisonZoom();

			// Angular half-extents visible in the comparison view
			const thetaH = 2 * Math.asin(Math.min(1, comparisonContainerH / 2 / (2 * compScale)));

			const thetaW = 2 * Math.asin(Math.min(1, comparisonContainerW / 2 / (2 * compScale)));

			// Map those angles to pixel distances on the orthographic globe
			return {
				w: 2 * globeRadius * Math.sin(thetaW),
				h: 2 * globeRadius * Math.sin(thetaH)
			};
		}

		// Continent center coordinates for rotation
		const continentCenters = {
			Africa: [20, 0],
			Antarctica: [0, -90],
			Asia: [100, 35],
			Europe: [15, 50],
			'North America': [-100, 40],
			'South America': [-58, -15],
			Oceania: [135, -25]
		};

		const continentOptions = Object.keys(continentCenters).sort().map((name) => ({ label: name, value: name, group: 'Continents' }));

		const countryOptionsList = countries.features.map((f) => ({
			label: f.properties?.name ?? String(f.id),
			value: f.properties?.name ?? String(f.id),
			group: 'Countries'
		})).filter((o) => o.label).sort((a, b) => a.label.localeCompare(b.label));

		const allOptions = [...continentOptions, ...countryOptionsList];
		let selectedAName = null;
		let selectedBName = null;

		function rotateToRegion(name, context) {
			if (!context?.transform) return;

			// Check continents first
			if (name in continentCenters) {
				const [lon, lat] = continentCenters[name];

				context.transform.setTranslate({ x: -lon, y: -lat });

				return;
			}

			// Otherwise look up country feature
			const feat = countries.features.find((f) => f.properties?.name === name);

			if (!feat) return;

			const [lon, lat] = geoCentroid(feat);

			context.transform.setTranslate({ x: -lon, y: -lat });
		}

		// Approximate angular radii for continents (degrees)
		const continentRadii = {
			Africa: 40,
			Antarctica: 30,
			Asia: 45,
			Europe: 25,
			'North America': 40,
			'South America': 35,
			Oceania: 25
		};

		// Compute the angular radius (in degrees) needed to encompass a region
		function angularExtent(name) {
			if (name in continentRadii) return continentRadii[name];

			const feat = countries.features.find((f) => f.properties?.name === name);

			if (!feat) return 30;

			const center = geoCentroid(feat);
			const bounds = geoBounds(feat);

			// Max angular distance from centroid to bounding box corners
			const corners = [
				[bounds[0][0], bounds[0][1]],
				[bounds[1][0], bounds[0][1]],
				[bounds[1][0], bounds[1][1]],
				[bounds[0][0], bounds[1][1]]
			];

			const maxDist = Math.max(...corners.map((c) => geoDistance(center, c)));

			return maxDist * (180 / Math.PI); // convert radians to degrees
		}

		// Compute ideal zoom for a given angular radius (degrees)
		// For azimuthal equal-area: zoom = 1 / (2 * sin(θ/2)), with buffer
		function zoomForExtent(angleDeg, buffer = 0.85) {
			const theta = angleDeg * (Math.PI / 180);

			return Math.max(zoomMin, Math.min(zoomMax, buffer / (2 * Math.sin(theta / 2))));
		}

		// Clear preset if selection doesn't match
		// Auto-zoom: reacts to either selection changing
		// Presets for quick comparisons (matching reference example)
		const presets = [
			{
				label: 'Africa vs North America',
				a: 'Africa',
				b: 'North America'
			},
			{ label: 'Sweden vs Madagascar', a: 'Sweden', b: 'Madagascar' },
			{
				label: 'Australia vs Antarctica',
				a: 'Australia',
				b: 'Antarctica'
			},
			{ label: 'Europe vs Brazil', a: 'Europe', b: 'Brazil' },
			{
				label: 'United States vs Australia',
				a: 'United States of America',
				b: 'Australia'
			},

			{
				label: 'South America vs Greenland',
				a: 'South America',
				b: 'Greenland'
			},

			{
				label: 'Brazil vs United States',
				a: 'Brazil',
				b: 'United States of America'
			},
			{ label: 'Africa vs Russia', a: 'Africa', b: 'Russia' },
			{
				label: 'Saudi Arabia vs Alaska',
				a: 'Saudi Arabia',
				b: 'United States of America'
			},
			{ label: 'Europe vs Antarctica', a: 'Europe', b: 'Antarctica' }
		];

		let selectedPreset = null;

		function applyPreset(preset) {
			selectedAName = preset.a;
			selectedBName = preset.b;
			selectedPreset = preset.label;
		}

		// Drag on comparison view rotates both globes together
		let draggingBoth = false;

		let dragStart = null;

		function startBothDrag(e) {
			draggingBoth = true;

			dragStart = {
				x: e.clientX,
				y: e.clientY,
				rA: [...rotateA()],
				rB: [...rotateB()]
			};

			e.currentTarget.setPointerCapture(e.pointerId);
		}

		function onBothDrag(e) {
			if (!draggingBoth || !dragStart) return;

			const dx = e.clientX - dragStart.x;
			const dy = e.clientY - dragStart.y;
			const sensitivity = 0.5 / comparisonZoom();

			contextA?.transform?.setTranslate(
				{
					x: dragStart.rA[0] + dx * sensitivity,
					y: Math.max(-90, Math.min(90, dragStart.rA[1] - dy * sensitivity))
				},
				{ duration: 0 }
			);

			contextB?.transform?.setTranslate(
				{
					x: dragStart.rB[0] + dx * sensitivity,
					y: Math.max(-90, Math.min(90, dragStart.rB[1] - dy * sensitivity))
				},
				{ duration: 0 }
			);
		}

		function endBothDrag() {
			draggingBoth = false;
			dragStart = null;
		}

		// Transform motion config shared by both globe charts
		const transformMotion = {
			mode: 'projection',
			motion: { type: 'tween', duration: 800, easing: cubicInOut },
			inertia: true
		};

		// Set initial positions once contexts are ready
		let initialized = false;

		const data = { countriesTopo, countries };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2"><div class="grid grid-cols-[1fr_1fr_auto] gap-2 items-end screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'Region A',
				options: allOptions,
				search: async (text, options) => options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
				placeholder: 'Search countries...',
				clearable: false,
				stepper: true,
				get value() {
					return selectedAName;
				},

				set value($$value) {
					selectedAName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SelectField($$renderer, {
				label: 'Region B',
				options: allOptions,
				search: async (text, options) => options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
				placeholder: 'Search countries...',
				clearable: false,
				stepper: true,
				get value() {
					return selectedBName;
				},

				set value($$value) {
					selectedBName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SelectField($$renderer, {
				label: 'Presets',
				options: presets.map((p) => ({ label: p.label, value: p.label })),
				placeholder: 'Quick compare...',
				stepper: true,
				get value() {
					return selectedPreset;
				},

				set value($$value) {
					selectedPreset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-[280px_1fr] gap-2"><div class="grid gap-2"><div class="border rounded-lg overflow-hidden bg-surface-100/50"><div class="text-xs font-medium px-2 pt-1 text-surface-content/60">Region A</div> <div class="h-52">`);

			{
				function children($$renderer, { context }) {
					const globeR = Math.min(context.width, context.height) / 2;
					const vp = viewportRectSize(globeR);

					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'fill-surface-200/50 stroke-surface-content/20'
							});

							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/10' });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(countries.features);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let feat = each_array[i];

								GeoPath($$renderer, {
									geojson: feat,
									class: 'fill-surface-content/70 stroke-surface-100/30'
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						children: ($$renderer) => {
							Rect($$renderer, {
								x: context.width / 2 - vp.w / 2,
								y: context.height / 2 - vp.h / 2,
								width: vp.w,
								height: vp.h,
								class: 'fill-surface-content/10 stroke-surface-content/50',
								strokeWidth: 1.5,
								rx: 1
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Chart($$renderer, {
					geo: { projection: geoOrthographic, fitGeojson: { type: 'Sphere' } },
					transform: transformMotion,
					padding: { top: 4, bottom: 4, left: 4, right: 4 },
					get context() {
						return contextA;
					},

					set context($$value) {
						contextA = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div></div> <div class="border rounded-lg overflow-hidden bg-surface-100/50"><div class="text-xs font-medium px-2 pt-1 text-surface-content/60">Region B</div> <div class="h-52">`);

			{
				function children($$renderer, { context }) {
					const globeR = Math.min(context.width, context.height) / 2;
					const vp = viewportRectSize(globeR);

					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'fill-surface-200/50 stroke-surface-content/20'
							});

							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/10' });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array_1 = $.ensure_array_like(countries.features);

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let feat = each_array_1[i];

								GeoPath($$renderer, {
									geojson: feat,
									class: 'fill-primary/70 stroke-primary-content/30',
									strokeWidth: 0.5
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						children: ($$renderer) => {
							Rect($$renderer, {
								x: context.width / 2 - vp.w / 2,
								y: context.height / 2 - vp.h / 2,
								width: vp.w,
								height: vp.h,
								class: 'fill-primary/10 stroke-surface-content/50',
								strokeWidth: 1.5,
								rx: 1
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Chart($$renderer, {
					geo: { projection: geoOrthographic, fitGeojson: { type: 'Sphere' } },
					transform: transformMotion,
					padding: { top: 4, bottom: 4, left: 4, right: 4 },
					get context() {
						return contextB;
					},

					set context($$value) {
						contextB = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div></div></div> <div class="border rounded-lg overflow-hidden bg-surface-100/50"><div class="text-xs font-medium px-2 pt-1 text-surface-content/60">True size comparison (Equal-Area)</div> <div${$.attr_class('h-108 cursor-grab overflow-hidden', void 0, { 'cursor-grabbing': draggingBoth })} role="application">`);

			{
				function children($$renderer, { context }) {
					const baseScale = Math.min(context.width, context.height) / 2;
					const scale = baseScale * context.transform.scale;
					const cx = context.width / 2;
					const cy = context.height / 2;

					Layer($$renderer, {
						children: ($$renderer) => {
							GeoProjection($$renderer, {
								projection: () => geoAzimuthalEqualArea().clipAngle(150),
								rotate: { yaw: rotateA()[0], pitch: rotateA()[1], roll: rotateA()[2] },
								scale,
								translate: [cx, cy],
								children: ($$renderer) => {
									Graticule($$renderer, { class: 'stroke-surface-content/5' });
									$$renderer.push(`<!----> <!--[-->`);

									const each_array_2 = $.ensure_array_like(countries.features);

									for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
										let feat = each_array_2[i];

										GeoPath($$renderer, {
											geojson: feat,
											class: 'fill-surface-content/80 stroke-surface-100/30',
											strokeWidth: 0.5
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						children: ($$renderer) => {
							GeoProjection($$renderer, {
								projection: () => geoAzimuthalEqualArea().clipAngle(150),
								rotate: { yaw: rotateB()[0], pitch: rotateB()[1], roll: rotateB()[2] },
								scale,
								translate: [cx, cy],
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_3 = $.ensure_array_like(countries.features);

									for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
										let feat = each_array_3[i];

										GeoPath($$renderer, {
											geojson: feat,
											class: 'fill-primary/50 stroke-primary-content',
											strokeWidth: 0.5
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Chart($$renderer, {
					geo: {
						projection: geoAzimuthalEqualArea,
						fitGeojson: { type: 'Sphere' }
					},
					transform: {
						mode: 'manual',
						scrollMode: 'scale',
						initialScale: 3,
						scaleExtent: [zoomMin, zoomMax],
						motion: { type: 'tween', duration: 800, easing: cubicInOut }
					},
					padding: { top: 0, bottom: 0, left: 0, right: 0 },
					get context() {
						return comparisonContext;
					},

					set context($$value) {
						comparisonContext = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div></div></div></div>`);
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