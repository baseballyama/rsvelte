import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import GeoJson from '$lib/GeoJSON.svelte';
import CircleLayer from '$lib/CircleLayer.svelte';
import { hoverStateFilter } from '$lib/filters';
import Popup from '$lib/Popup.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		function randomCircle(color) {
			const lng = Math.random() * 360 - 180;
			const lat = Math.random() * 180 - 90;
			const radius = Math.random() * 50;

			return {
				type: 'Feature',
				properties: { radius, color },
				geometry: { type: 'Point', coordinates: [lng, lat] }
			};
		}

		const layer1 = Array.from({ length: 20 }, () => randomCircle('red'));
		const layer2 = Array.from({ length: 20 }, () => randomCircle('green'));
		const layer3 = Array.from({ length: 20 }, () => randomCircle('blue'));

		const layers = [
			{ data: layer1, color: 'red', hoverCursor: 'help' },
			{ data: layer2, color: 'green', hoverCursor: '' },
			{ data: layer3, color: 'blue', hoverCursor: 'not-allowed' }
		];

		const lastEvent = [];

		function labelFeature(f) {
			if (!f) {
				return 'None';
			}

			return f.geometry.coordinates.map((c) => c.toFixed(4)).join(' ,');
		}

		let eventsIfTopMost = true;
		let openIfTopMost = true;
		let openOn = 'hover';
		let allowOn = 'all';

		$$renderer.push(`<div class="mx-auto mb-2 flex flex-col items-start gap-1"><label><input type="checkbox"${$.attr('checked', eventsIfTopMost, true)}/> When layers overlap, only fire events for top-most layer</label> <label><input type="checkbox"${$.attr('checked', openIfTopMost, true)}/> When layers overlap, only activate the popup for top-most layer</label> <fieldset class="flex gap-x-4"><legend>Show popup on</legend> <label><input type="radio"${$.attr('checked', openOn === 'hover', true)} value="hover"/> Hover</label> <label><input type="radio"${$.attr('checked', openOn === 'click', true)} value="click"/> Click</label> <label><input type="radio"${$.attr('checked', openOn === 'dblclick', true)} value="dblclick"/> Double Click</label> <label><input type="radio"${$.attr('checked', openOn === 'contextmenu', true)} value="contextmenu"/> Context Menu (right-click)</label></fieldset> <fieldset class="flex gap-4"><legend>Allow popup on</legend> <label><input type="radio"${$.attr('checked', allowOn === 'all', true)} value="all"/> All Colors</label> <label><input type="radio"${$.attr('checked', allowOn === 'red', true)} value="red"/> Only Red</label> <label><input type="radio"${$.attr('checked', allowOn === 'green', true)} value="green"/> Only Green</label> <label><input type="radio"${$.attr('checked', allowOn === 'blue', true)} value="blue"/> Only Blue</label></fieldset> <div class="grid grid-cols-[auto_1fr] gap-x-2"><!--[-->`);

		const each_array = $.ensure_array_like(layers);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let layer = each_array[i];

			$$renderer.push(`<span class="flex-none">Last Event for ${$.escape(layer.color)} layer:</span> <span class="w-64">${$.escape(labelFeature(lastEvent[i]))}</span>`);
		}

		$$renderer.push(`<!--]--></div></div> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
			standardControls: true,
			zoomOnDoubleClick: openOn !== 'dblclick',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(layers);

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let { data, color, hoverCursor } = each_array_1[i];

					GeoJson($$renderer, {
						id: `layer${$.stringify(i + 1)}`,
						data: { type: 'FeatureCollection', features: data },
						generateId: true,
						children: ($$renderer) => {
							CircleLayer($$renderer, {
								eventsIfTopMost,
								manageHoverState: true,
								hoverCursor,
								paint: {
									'circle-color': color,
									'circle-radius': ['get', 'radius'],
									'circle-opacity': hoverStateFilter(1.0, 0.5)
								},

								onclick: (e) => {
									lastEvent[i] = e.features?.[0];
								},

								onmouseleave: (e) => {
									lastEvent[i] = undefined;
								},

								onmousemove: (e) => {
									lastEvent[i] = e.features?.[0];
								},

								children: ($$renderer) => {
									{
										function children($$renderer, { features }) {
											$$renderer.push(`<div${$.attr_style('', { background: color, color: 'white' })}><p>${$.escape(features?.length)} features from ${$.escape(color)} layer</p> `);

											if (color == 'red') {
												$$renderer.push(`<!--[0--><p>extra padding for lowest red layer</p> <p>extra padding for lowest red layer</p>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (color == 'green') {
												$$renderer.push(`<!--[0--><p>extra padding for middle green layer</p>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										}

										Popup($$renderer, {
											openOn,
											openIfTopMost,
											canOpen: (features) => allowOn === 'all' || features?.[0]?.properties?.color === allowOn,
											children,
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}