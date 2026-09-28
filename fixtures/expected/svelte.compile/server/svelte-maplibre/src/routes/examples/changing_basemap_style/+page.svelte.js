import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { SymbolLayer, MapLibre, GeoJSON, FillLayer, LineLayer } from '$lib';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import states from '$site/states.json?url';
import quakeImageUrl from '$site/earthquake.png';
import tsunamiImageUrl from '$site/tsunami.png';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let showBorder = true;
		let showFill = true;
		let fillColor = '#006600';
		let borderColor = '#003300';
		let selected = 'light';

		let style = $.derived(() => selected === 'light'
			? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
			: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json');

		const coloradoPolygon = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Polygon',
						coordinates: [[[-109, 37], [-102, 37], [-102, 41], [-109, 41], [-109, 37]]]
					}
				}
			]
		};

		const pointsData = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: { image: 'quake' },
					geometry: { type: 'Point', coordinates: [-127.5, 45.5] }
				},

				{
					type: 'Feature',
					properties: { image: 'tsunami' },
					geometry: { type: 'Point', coordinates: [-91.6, 28.7] }
				}
			]
		};

		let dataOption = 'states';
		let dataset = $.derived(() => dataOption === 'states' ? states : coloradoPolygon);

		$$renderer.push(`<div class="controls svelte-r0s2ik">`);

		$$renderer.select(
			{ class: 'controls-select', value: selected },
			($$renderer) => {
				$$renderer.option({ value: 'light' }, ($$renderer) => {
					$$renderer.push(`Light`);
				});

				$$renderer.option({ value: 'dark' }, ($$renderer) => {
					$$renderer.push(`dark`);
				});
			},
			'svelte-r0s2ik'
		);

		$$renderer.push(` `);

		$$renderer.select(
			{ class: 'controls-select', value: dataOption },
			($$renderer) => {
				$$renderer.option({ value: 'states' }, ($$renderer) => {
					$$renderer.push(`States Dataset`);
				});

				$$renderer.option({ value: 'colorado' }, ($$renderer) => {
					$$renderer.push(`Colorado Dataset`);
				});
			},
			'svelte-r0s2ik'
		);

		$$renderer.push(`</div> `);

		MapLibre($$renderer, {
			style: style(),
			class: mapClasses,
			standardControls: true,
			center: [-98.137, 40.137],
			zoom: 3,
			images: [
				{ id: 'quake', url: quakeImageUrl },
				{ id: 'tsunami', url: tsunamiImageUrl }
			],

			children: ($$renderer) => {
				GeoJSON($$renderer, {
					id: 'states',
					data: dataset(),
					promoteId: 'STATEFP',
					children: ($$renderer) => {
						if (showFill) {
							$$renderer.push('<!--[0-->');

							FillLayer($$renderer, {
								paint: { 'fill-color': fillColor, 'fill-opacity': 0.5 },
								beforeLayerType: 'symbol'
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

				$$renderer.push(`<!----> `);

				GeoJSON($$renderer, {
					data: pointsData,
					children: ($$renderer) => {
						SymbolLayer($$renderer, { layout: { 'icon-image': ['get', 'image'] } });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}