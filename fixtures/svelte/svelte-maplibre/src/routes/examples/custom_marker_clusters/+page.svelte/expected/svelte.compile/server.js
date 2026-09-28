import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import { mapClasses } from '../styles';
import Popup from '$lib/Popup.svelte';
import ClusterPopup from '../ClusterPopup.svelte';
import clusterPopupCode from '../ClusterPopup.svelte?raw';
import MarkerLayer from '$lib/MarkerLayer.svelte';
import quakeImageUrl from '$site/earthquake.png';
import tsunamiImageUrl from '$site/tsunami.png';
import earthquakes from '$site/earthquakes.geojson?url';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let clickedFeature = void 0;
		let openOn = 'hover';

		$$renderer.push(`<p>Data and layer configuration derived from <a href="https://maplibre.org/maplibre-gl-js-docs/example/cluster/">MapLibre Cluster Example.</a></p> <fieldset class="mb-2 flex gap-x-4 self-start border border-gray-300 px-2"><legend>Show popup on</legend> <label><input type="radio"${$.attr('checked', openOn === 'hover', true)} value="hover"/> Hover</label> <label><input type="radio"${$.attr('checked', openOn === 'click', true)} value="click"/> Click</label> <label><input type="radio"${$.attr('checked', openOn === 'dblclick', true)} value="dblclick"/> Double Click</label> <label><input type="radio"${$.attr('checked', openOn === 'contextmenu', true)} value="contextmenu"/> Context Menu (right-click)</label></fieldset> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			zoomOnDoubleClick: openOn !== 'dblclick',
			standardControls: true,
			children: ($$renderer) => {
				GeoJSON($$renderer, {
					id: 'earthquakes',
					data: earthquakes,
					cluster: {
						radius: 50,
						maxZoom: 14,
						properties: { total_mag: ['+', ['get', 'mag']] }
					},

					children: ($$renderer) => {
						{
							function children($$renderer, { feature }) {
								$$renderer.push(`<div class="rounded-full bg-orange-200 p-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 11.5A2.5 2.5 0 0 0 16.5 9A2.5 2.5 0 0 0 14 6.5A2.5 2.5 0 0 0 11.5 9a2.5 2.5 0 0 0 2.5 2.5M14 2c3.86 0 7 3.13 7 7c0 5.25-7 13-7 13S7 14.25 7 9a7 7 0 0 1 7-7M5 9c0 4.5 5.08 10.66 6 11.81L10 22S3 14.25 3 9c0-3.17 2.11-5.85 5-6.71C6.16 3.94 5 6.33 5 9Z"></path></svg></div> `);

								Popup($$renderer, {
									openOn,
									closeOnClickInside: true,
									children: ($$renderer) => {
										ClusterPopup($$renderer, { feature });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							}

							MarkerLayer($$renderer, {
								applyToClusters: true,
								asButton: true,
								onclick: (e) => clickedFeature = e.feature?.properties,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { feature }) {
								$$renderer.push(`<img${$.attr('src', feature.properties?.tsunami ? tsunamiImageUrl : quakeImageUrl)} alt="Earthquake"/> `);

								Popup($$renderer, {
									openOn,
									closeOnClickInside: true,
									children: ($$renderer) => {
										const props = feature.properties;

										$$renderer.push(`<p>Date: <span class="font-medium text-gray-800">${$.escape(new Date(props?.time).toLocaleDateString())}</span></p> <p>Magnitude: <span class="font-medium text-gray-800">${$.escape(props?.mag)}</span></p> <p>Tsunami: <span class="font-medium text-gray-800">${$.escape(props?.tsunami ? 'Yes' : 'No')}</span></p>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							}

							MarkerLayer($$renderer, {
								applyToClusters: false,
								anchor: 'bottom',
								asButton: true,
								onclick: (e) => clickedFeature = e.feature?.properties,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (clickedFeature) {
			$$renderer.push('<!--[0-->');

			if (clickedFeature.cluster) {
				$$renderer.push(`<!--[0--><p>Number of Earthquakes: <span class="font-bold text-gray-800">${$.escape(clickedFeature['point_count'])}</span></p> <p>Average Magnitude: <span class="font-bold text-gray-800">${$.escape((clickedFeature.total_mag / clickedFeature.point_count).toFixed(2))}</span></p>`);
			} else {
				$$renderer.push(`<!--[-1--><p>Magnitude: <span class="font-bold text-gray-800">${$.escape(clickedFeature.mag)}</span></p>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		CodeSample($$renderer, { code, endBoundary: '<CodeSample', omitEndBoundary: true });
		$$renderer.push(`<!----> `);

		CodeSample($$renderer, {
			code: clusterPopupCode,
			filename: 'ClusterPopup.svelte',
			startBoundary: '',
			endBoundary: ''
		});

		$$renderer.push(`<!----> <footer class="self-start"><p><a class="text-sm" href="https://www.flaticon.com/free-icons/earthquake" title="earthquake icons">Earthquake icons created by Freepik - Flaticon</a></p> <p><a class="text-sm" href="https://www.flaticon.com/free-icons/tsunami" title="tsunami icons">Tsunami icons created by surang - Flaticon</a></p></footer>`);
	});
}