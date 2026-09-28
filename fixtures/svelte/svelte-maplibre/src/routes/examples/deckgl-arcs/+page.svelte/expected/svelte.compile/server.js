import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import DeckGlLayer from '$lib/DeckGlLayer.svelte';
import { ArcLayer } from '@deck.gl/layers';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import { geoCentroid } from 'd3-geo';
import clamp from 'just-clamp';
import counties from '$site/counties.json';
import states from '$site/states.json';
import Popup from '$lib/Popup.svelte';
import FillLayer from '$lib/FillLayer.svelte';
import GeoJson from '$lib/GeoJSON.svelte';
import { hoverStateFilter } from '$lib';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		// [longitude, latitude]
		// [longitude, latitude]
		// RGB values
		// RGB values
		function calculateArcs(fc) {
			let centers = new Map(fc.features.map((f) => [f.properties?.GEOID, geoCentroid(f)]));
			let count = fc.features.length > 100 ? 5000 : 100;

			let indexes = Array.from({ length: count }, (_, i) => [
				Math.ceil(Math.random() * (fc.features.length - 1)),
				Math.ceil(Math.random() * (fc.features.length - 1))
			]);

			return indexes.map(([fromIndex, toIndex]) => {
				let from = fc.features[fromIndex];
				let to = fc.features[toIndex];

				return {
					fromName: from.properties.NAME,
					toName: to.properties.NAME,
					fromState: from.properties.STATEFP,
					toState: to.properties.STATEFP,
					source: centers.get(from.properties.GEOID),
					target: centers.get(to.properties.GEOID),
					sourceColor: [255, 128, 0],
					targetColor: [0, 125, 255]
				};
			});
		}

		let zoom = 3;
		let hovered = void 0;
		let mode = 'showOne';
		let arcs = $.derived(() => calculateArcs(mode === 'showAll' ? states : counties));
		let activeState = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<p>A deck.gl ArcLayer integrated into a MapLibre map, with hover and popup support.</p> <fieldset class="mb-2 self-start border border-gray-400 p-2"><legend>View Mode</legend> <div class="flex flex-wrap gap-2"><label><input type="radio"${$.attr('checked', mode === 'showOne', true)} value="showOne"/> Show county arcs for hovered state</label> <label><input type="radio"${$.attr('checked', mode === 'showAll', true)} value="showAll"/> Show state arcs</label></div></fieldset> `);

			MapLibre($$renderer, {
				style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
				pitch: 30,
				center: [-100, 40],
				maxZoom: 5,
				class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
				standardControls: true,
				get zoom() {
					return zoom;
				},

				set zoom($$value) {
					zoom = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					GeoJson($$renderer, {
						id: 'states-base',
						data: states,
						promoteId: 'GEOID',
						children: ($$renderer) => {
							FillLayer($$renderer, {
								id: 'counties-click',
								hoverCursor: 'pointer',
								paint: {
									'fill-color': '#000',
									'fill-opacity': mode === 'showOne' ? hoverStateFilter(0, 0.1) : 0
								},
								manageHoverState: true,
								onmousemove: (e) => {
									if (mode === 'showOne') {
										let newGeoId = e.features[0]?.properties?.STATEFP;

										if (newGeoId !== activeState) {
											activeState = newGeoId;
											hovered = undefined;
										}
									}
								}
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DeckGlLayer($$renderer, {
						type: ArcLayer,
						data: arcs().filter((a, i) => {
							if (mode === 'showAll') return i < 50000;

							return a.fromState === activeState || a.toState === activeState;
						}),
						getSourcePosition: (d) => d.source,
						getTargetPosition: (d) => d.target,
						getSourceColor: (d) => d.sourceColor,
						getTargetColor: (d) => d.targetColor,
						autoHighlight: mode === 'showAll',
						highlightColor: [30, 255, 30],
						getWidth: mode === 'showAll' ? 5 : 1,
						getHeight: clamp(3 / zoom, 0, 1),
						get hovered() {
							return hovered;
						},

						set hovered($$value) {
							hovered = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							{
								function children($$renderer, { data }) {
									if (data) {
										$$renderer.push(`<!--[0-->From ${$.escape(data.fromName)} to ${$.escape(data.toName)}`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								Popup($$renderer, { openOn: 'click', children, $$slots: { default: true } });
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h4>`);

			if (hovered && mode === 'showAll') {
				$$renderer.push(`<!--[0-->From ${$.escape(hovered.fromName)} to ${$.escape(hovered.toName)}`);
			} else if (mode === 'showOne') {
				$$renderer.push(`<!--[1-->${$.escape(states.features.find((f) => f.properties.STATEFP === activeState)?.properties.NAME)}`);
			} else {
				$$renderer.push(`<!--[-1-->Hover over an arc to see its endpoints`);
			}

			$$renderer.push(`<!--]--></h4> `);
			CodeSample($$renderer, { code });
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