import * as $ from 'svelte/internal/server';

import {
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic,
	geoCentroid
} from 'd3-geo';

import { feature } from 'topojson-client';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { Button, SelectField } from 'svelte-ux';
import { getCountriesTopology, getUsStatesTopology } from '$lib/geo.remote';

const countriesTopo = await getCountriesTopology();
const statesTopo = await getUsStatesTopology();

export default function True_size($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(countriesTopo, countriesTopo.objects.countries);
		const usStates = feature(statesTopo, statesTopo.objects.states);

		const projections = [
			{ label: 'Mercator', value: geoMercator },
			{ label: 'Orthographic', value: geoOrthographic },
			{ label: 'Equal Earth', value: geoEqualEarth },
			{ label: 'Natural Earth', value: geoNaturalEarth1 },
			{ label: 'Equirectangular', value: geoEquirectangular }
		];

		const goldenRatio = 0.618033988749895;
		let hueOffset = 0;

		function nextColor() {
			const color = interpolateTurbo((hueOffset + 0.1) % 1);

			hueOffset = (hueOffset + goldenRatio) % 1;

			return color;
		}

		let projection = geoMercator;
		let selectedShapes = [];
		const countryOptions = $.derived(() => countries.features.map((f) => ({ label: f.properties?.name ?? String(f.id), value: f })).filter((o) => o.label).sort((a, b) => a.label.localeCompare(b.label)));
		const stateOptions = $.derived(() => usStates.features.map((f) => ({ label: f.properties?.name ?? String(f.id), value: f })).filter((o) => o.label).sort((a, b) => a.label.localeCompare(b.label)));
		let selectedCountry = null;
		let selectedState = null;

		function addShape(feat) {
			const color = nextColor();

			selectedShapes.push({ feature: feat, offset: [0, 0], rotation: 0, color });
		}

		function removeShape(index) {
			selectedShapes.splice(index, 1);
		}

		// --- Coordinate transformation (translate + rotate) ---
		function transformCoords(coords, dLon, dLat, angleDeg, centerLon, centerLat) {
			if (typeof coords[0] === 'number') {
				let [lon, lat] = coords;

				// Rotate around centroid first, then translate
				if (angleDeg !== 0) {
					const rad = angleDeg * Math.PI / 180;
					const cos = Math.cos(rad);
					const sin = Math.sin(rad);
					const dx = lon - centerLon;
					const dy = lat - centerLat;

					lon = centerLon + dx * cos - dy * sin;
					lat = centerLat + dx * sin + dy * cos;
				}

				return [lon + dLon, lat + dLat];
			}

			return coords.map((c) => transformCoords(c, dLon, dLat, angleDeg, centerLon, centerLat));
		}

		function transformGeometry(geometry, dLon, dLat, angleDeg, centerLon, centerLat) {
			if (geometry.type === 'GeometryCollection') {
				return {
					...geometry,
					geometries: geometry.geometries.map((g) => transformGeometry(g, dLon, dLat, angleDeg, centerLon, centerLat))
				};
			}

			return {
				...geometry,
				coordinates: transformCoords(geometry.coordinates, dLon, dLat, angleDeg, centerLon, centerLat)
			};
		}

		function transformFeature(feat, dLon, dLat, angleDeg) {
			const [centerLon, centerLat] = geoCentroid(feat);

			return {
				...feat,
				geometry: transformGeometry(feat.geometry, dLon, dLat, angleDeg, centerLon, centerLat)
			};
		}

		// --- Drag handling ---
		let dragIndex = null;

		let dragStartLonLat = null;
		let dragStartOffset = null;

		function svgPoint(e) {
			const el = e.target;
			const pt = new DOMPoint(e.clientX, e.clientY);
			const svgPt = pt.matrixTransform(el.getScreenCTM().inverse());

			return [svgPt.x, svgPt.y];
		}

		function startDrag(e, index, proj) {
			e.stopPropagation();
			dragIndex = index;

			const coords = svgPoint(e);
			const lonLat = proj?.invert?.(coords);

			if (lonLat) {
				dragStartLonLat = lonLat;
				dragStartOffset = [...selectedShapes[index].offset];
			}

			e.target.setPointerCapture(e.pointerId);
		}

		function onDrag(e, proj) {
			if (dragIndex === null || !dragStartLonLat || !dragStartOffset) return;

			const coords = svgPoint(e);
			const lonLat = proj?.invert?.(coords);

			if (lonLat) {
				selectedShapes[dragIndex].offset = [
					dragStartOffset[0] + (lonLat[0] - dragStartLonLat[0]),
					dragStartOffset[1] + (lonLat[1] - dragStartLonLat[1])
				];
			}
		}

		function endDrag() {
			dragIndex = null;
			dragStartLonLat = null;
			dragStartOffset = null;
		}

		const data = { countriesTopo, statesTopo, countries, usStates };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2"><div class="grid grid-cols-3 gap-2 screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'Projection',
				options: projections,
				clearable: false,
				get value() {
					return projection;
				},

				set value($$value) {
					projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SelectField($$renderer, {
				label: 'Add country',
				options: countryOptions(),
				search: async (text, options) => options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
				clearable: true,
				placeholder: 'Search countries...',
				get value() {
					return selectedCountry;
				},

				set value($$value) {
					selectedCountry = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SelectField($$renderer, {
				label: 'Add US state',
				options: stateOptions(),
				search: async (text, options) => options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase())),
				clearable: true,
				placeholder: 'Search states...',
				get value() {
					return selectedState;
				},

				set value($$value) {
					selectedState = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			if (selectedShapes.length) {
				$$renderer.push(`<!--[0--><div class="flex gap-2 flex-wrap items-center screenshot-hidden"><!--[-->`);

				const each_array = $.ensure_array_like(selectedShapes);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let shape = each_array[i];

					$$renderer.push(`<div class="flex items-center gap-1 border rounded-lg px-2 py-1"><span class="w-3 h-3 rounded-full inline-block shrink-0"${$.attr_style('', { background: shape.color })}></span> <span class="text-sm whitespace-nowrap">${$.escape(shape.feature.properties?.name ?? 'Unknown')}</span> <input type="range"${$.attr('min', -180)}${$.attr('max', 180)}${$.attr('step', 1)}${$.attr('value', shape.rotation)} class="w-20 h-4 accent-current"${$.attr('title', `Rotate: ${$.stringify(shape.rotation)}°`)}${$.attr_style('', { color: shape.color })}/> <span class="text-xs text-surface-content/50 w-8 text-right">${$.escape(shape.rotation)}°</span> <button class="text-surface-content/40 hover:text-surface-content ml-1">×</button></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="h-150 bg-surface-100/50 border rounded-lg overflow-hidden">`);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							Graticule($$renderer, { class: 'stroke-surface-content/10' });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array_1 = $.ensure_array_like(countries.features);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let feature = each_array_1[$$index_1];

								GeoPath($$renderer, {
									geojson: feature,
									class: 'stroke-surface-content/20 fill-surface-200'
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_2 = $.ensure_array_like(selectedShapes);

							for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
								let shape = each_array_2[i];
								const translated = transformFeature(shape.feature, shape.offset[0], shape.offset[1], shape.rotation);

								GeoPath($$renderer, {
									geojson: translated,
									fill: shape.color,
									'fill-opacity': 0.5,
									stroke: shape.color,
									strokeWidth: 2 / context.transform.scale,
									class: dragIndex === i ? 'cursor-grabbing' : 'cursor-grab',
									onpointerdown: (e) => startDrag(e, i, context.geo.projection),
									onpointermove: (e) => onDrag(e, context.geo.projection),
									onpointerup: () => endDrag(),
									onpointercancel: () => endDrag()
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Chart($$renderer, {
					geo: { projection, fitGeojson: countries },
					transform: {
						mode: 'projection',
						scrollMode: 'scale',
						scaleExtent: [0.5, 10],
						translateExtent: [[-300, -200], [300, 200]]
					},
					padding: { top: 8, bottom: 8, left: 8, right: 8 },
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div></div>`);
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