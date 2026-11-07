import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import FillLayer from '$lib/FillLayer.svelte';
import LineLayer from '$lib/LineLayer.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import states from '$site/states.json?url';
import { contrastingColor } from '$site/colors.js';
import { hoverStateFilter } from '$lib/filters.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let showBorder = true;
		let showFill = true;
		let fillColor = '#006600';
		let borderColor = '#003300';
		let map = void 0;
		let loaded = false;

		let textLayers = $.derived(() => map && loaded
			? map.getStyle().layers.filter((layer) => {
				return layer.type === 'symbol' && layer['source-layer'] === 'place';
			})
			: []);

		let colors = $.derived(() => contrastingColor(fillColor));
		let filterStates = false;

		let filter = $.derived(() => filterStates
			? ['==', 'T', ['slice', ['get', 'NAME'], 0, 1]]
			: undefined);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid w-full max-w-md items-center gap-y-2 self-start svelte-10ngguv"><label><input type="checkbox"${$.attr('checked', showFill, true)}/> Show fill</label> <label><input type="color"${$.attr('value', fillColor)}/> Fill Color</label> <label><input type="checkbox"${$.attr('checked', showBorder, true)}/> Show border</label> <label><input type="color"${$.attr('value', borderColor)}/> Border Color</label></div> <label><input type="checkbox"${$.attr('checked', filterStates, true)}/> Only show states starting with 'T'</label> `);

			MapLibre($$renderer, {
				style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
				class: mapClasses,
				standardControls: true,
				center: [-98.137, 40.137],
				zoom: 4,
				get map() {
					return map;
				},

				set map($$value) {
					map = $$value;
					$$settled = false;
				},

				get loaded() {
					return loaded;
				},

				set loaded($$value) {
					loaded = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					GeoJSON($$renderer, {
						id: 'states',
						data: states,
						promoteId: 'STATEFP',
						children: ($$renderer) => {
							if (showFill) {
								$$renderer.push('<!--[0-->');

								FillLayer($$renderer, {
									paint: {
										'fill-color': hoverStateFilter(fillColor, colors().hoverBgColor),
										'fill-opacity': 0.5
									},
									filter: filter(),
									beforeLayerType: 'symbol',
									manageHoverState: true
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (showBorder) {
								$$renderer.push('<!--[0-->');

								LineLayer($$renderer, {
									layout: { 'line-cap': 'round', 'line-join': 'round' },
									paint: { 'line-color': borderColor, 'line-width': 3 },
									beforeLayerType: 'symbol'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
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