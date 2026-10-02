import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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
import quakeImageUrl from '$site/earthquake.png';
import tsunamiImageUrl from '$site/tsunami.png';
import earthquakes from '$site/earthquakes.geojson?url';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p>Number of Earthquakes: <span class="font-bold text-gray-800"> </span></p> <p>Average Magnitude: <span class="font-bold text-gray-800"> </span></p>`, 1);
var root_2 = $.from_html(`<p>Magnitude: <span class="font-bold text-gray-800"> </span></p>`);

var root_3 = $.from_html(
	`<p>Data from <a href="https://maplibre.org/maplibre-gl-js-docs/example/cluster/">MapLibre cluster Example.</a></p> <!> <!> <p>Symbol images are embedded into the map and rendered via webGL. This makes them faster but less
  flexible. For more rendering flexibility such as using SVG, see the <a href="/examples/custom_marker">Custom Marker</a> example.</p> <!> <footer class="self-start"><p><a class="text-sm" href="https://www.flaticon.com/free-icons/earthquake" title="earthquake icons">Earthquake icons created by Freepik - Flaticon</a></p> <p><a class="text-sm" href="https://www.flaticon.com/free-icons/tsunami" title="tsunami icons">Tsunami icons created by surang - Flaticon</a></p></footer>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let clickedFeature = $.state(void 0);
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 2);

	{
		const children = ($$anchor, $$arg0) => {
			let allImagesLoaded = () => ($$arg0?.()).allImagesLoaded;

			GeoJSON($$anchor, {
				id: 'earthquakes',
				get data() {
					return earthquakes;
				},

				cluster: {
					radius: 500,
					maxZoom: 14,
					properties: { total_mag: ['+', ['get', 'mag']] }
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => ({
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
						}));

						CircleLayer(node_1, {
							applyToClusters: true,
							hoverCursor: 'pointer',
							get paint() {
								return $.get($0);
							},
							manageHoverState: true,
							onclick: (e) => $.set(clickedFeature, e.features?.[0]?.properties, true)
						});
					}

					var node_2 = $.sibling(node_1, 2);

					SymbolLayer(node_2, {
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

					var node_3 = $.sibling(node_2, 2);

					SymbolLayer(node_3, {
						applyToClusters: false,
						hoverCursor: 'pointer',
						layout: {
							'icon-image': ['case', ['==', ['get', 'tsunami'], 0], 'quake', 'tsunami'],
							'icon-allow-overlap': true,
							'text-field': '{mag}',
							'text-offset': [0, -2],
							'text-size': 12
						},
						onclick: (e) => $.set(clickedFeature, e.features?.[0]?.properties, true)
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => [
			{ id: 'quake', url: quakeImageUrl },
			{ id: 'tsunami', url: tsunamiImageUrl }
		]);

		MapLibre(node, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			get class() {
				return mapClasses;
			},
			standardControls: true,
			get images() {
				return $.get($0);
			},
			children,
			$$slots: { default: true }
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			{
				var consequent = ($$anchor) => {
					var fragment_4 = root_1();
					var p = $.first_child(fragment_4);
					var span = $.sibling($.child(p));
					var text = $.only_child(span, true);

					$.reset(p);

					var p_1 = $.sibling(p, 2);
					var span_1 = $.sibling($.child(p_1));
					var text_1 = $.only_child(span_1, true);

					$.reset(p_1);

					$.template_effect(
						($0) => {
							$.set_text(text, $.get(clickedFeature)['point_count']);
							$.set_text(text_1, $0);
						},
						[
							() => ($.get(clickedFeature).total_mag / $.get(clickedFeature).point_count).toFixed(2)
						]
					);

					$.append($$anchor, fragment_4);
				};

				var alternate = ($$anchor) => {
					var p_2 = root_2();
					var span_2 = $.sibling($.child(p_2));
					var text_2 = $.only_child(span_2, true);

					$.reset(p_2);
					$.template_effect(() => $.set_text(text_2, $.get(clickedFeature).mag));
					$.append($$anchor, p_2);
				};

				$.if(node_5, ($$render) => {
					if ($.get(clickedFeature).cluster) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node_4, ($$render) => {
			if ($.get(clickedFeature)) $$render(consequent_1);
		});
	}

	var node_6 = $.sibling(node_4, 4);

	CodeSample(node_6, {
		get code() {
			return code;
		},
		endBoundary: '<!-- ENDEMBED',
		omitEndBoundary: true
	});

	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}