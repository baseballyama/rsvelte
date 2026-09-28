import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import { mapClasses } from '../styles';
import CircleLayer from '$lib/CircleLayer.svelte';
import SymbolLayer from '$lib/SymbolLayer.svelte';
import { hoverStateFilter } from '$lib/filters';
import Popup from '$lib/Popup.svelte';
import ClusterPopup from '../ClusterPopup.svelte';
import clusterPopupCode from '../ClusterPopup.svelte?raw';
import earthquakes from '$site/earthquakes.geojson?url';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let clickedFeature = void 0;
		let openOn = 'hover';

		$$renderer.push(`<p>Data and layer configuration derived from <a href="https://maplibre.org/maplibre-gl-js-docs/example/cluster/">MapLibre cluster Example.</a></p> <fieldset class="mb-2 flex gap-x-4 self-start border border-gray-300 px-2"><legend>Show popup on</legend> <label><input type="radio"${$.attr('checked', openOn === 'hover', true)} value="hover"/> Hover</label> <label><input type="radio"${$.attr('checked', openOn === 'click', true)} value="click"/> Click</label> <label><input type="radio"${$.attr('checked', openOn === 'dblclick', true)} value="dblclick"/> Double Click</label> <label><input type="radio"${$.attr('checked', openOn === 'contextmenu', true)} value="contextmenu"/> Context Menu (right-click)</label></fieldset> `);

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
						CircleLayer($$renderer, {
							id: 'cluster_circles',
							applyToClusters: true,
							hoverCursor: 'pointer',
							paint: {
								'circle-color': [
									'step',
									['get', 'point_count'],
									'#51bbd6',
									100,
									'#f1f075',
									750,
									'#f28cb1'
								],
								'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
								'circle-stroke-color': '#f00',
								'circle-stroke-width': 1,
								'circle-stroke-opacity': hoverStateFilter(0, 1)
							},
							manageHoverState: true,
							onclick: (e) => clickedFeature = e.features?.[0]?.properties,
							children: ($$renderer) => {
								{
									function children($$renderer, { data }) {
										ClusterPopup($$renderer, { feature: data ?? undefined });
									}

									Popup($$renderer, {
										openOn,
										closeOnClickInside: true,
										children,
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						SymbolLayer($$renderer, {
							id: 'cluster_labels',
							interactive: false,
							applyToClusters: true,
							layout: {
								'text-field': [
									'format',
									['get', 'point_count_abbreviated'],
									{},
									'\n',
									{},
									[
										'number-format',
										['/', ['get', 'total_mag'], ['get', 'point_count']],
										{ 'max-fraction-digits': 2 }
									],
									{ 'font-scale': 0.8 }
								],
								'text-size': 12,
								'text-offset': [0, -0.1]
							}
						});

						$$renderer.push(`<!----> `);

						CircleLayer($$renderer, {
							id: 'earthquakes_circle',
							applyToClusters: false,
							hoverCursor: 'pointer',
							paint: {
								'circle-color': '#11b4da',
								'circle-radius': 4,
								'circle-stroke-width': 1,
								'circle-stroke-color': '#fff'
							},
							onclick: (e) => clickedFeature = e.features?.[0]?.properties,
							children: ($$renderer) => {
								{
									function children($$renderer, { data }) {
										const props = data?.properties;

										if (props) {
											$$renderer.push(`<!--[0--><p>Date: <span class="font-medium text-gray-800">${$.escape(new Date(props.time).toLocaleDateString())}</span></p> <p>Magnitude: <span class="font-medium text-gray-800">${$.escape(props.mag)}</span></p> <p>Tsunami: <span class="font-medium text-gray-800">${$.escape(props.tsunami ? 'Yes' : 'No')}</span></p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}

									Popup($$renderer, {
										openOn,
										closeOnClickInside: true,
										children,
										$$slots: { default: true }
									});
								}
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

		$$renderer.push(`<!---->`);
	});
}