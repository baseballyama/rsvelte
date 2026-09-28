import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="rounded-full bg-orange-200 p-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 11.5A2.5 2.5 0 0 0 16.5 9A2.5 2.5 0 0 0 14 6.5A2.5 2.5 0 0 0 11.5 9a2.5 2.5 0 0 0 2.5 2.5M14 2c3.86 0 7 3.13 7 7c0 5.25-7 13-7 13S7 14.25 7 9a7 7 0 0 1 7-7M5 9c0 4.5 5.08 10.66 6 11.81L10 22S3 14.25 3 9c0-3.17 2.11-5.85 5-6.71C6.16 3.94 5 6.33 5 9Z"></path></svg></div> <!>`, 1);
var root_1 = $.from_html(`<p>Date: <span class="font-medium text-gray-800"> </span></p> <p>Magnitude: <span class="font-medium text-gray-800"> </span></p> <p>Tsunami: <span class="font-medium text-gray-800"> </span></p>`, 1);
var root_2 = $.from_html(`<img alt="Earthquake"/> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<p>Number of Earthquakes: <span class="font-bold text-gray-800"> </span></p> <p>Average Magnitude: <span class="font-bold text-gray-800"> </span></p>`, 1);
var root_5 = $.from_html(`<p>Magnitude: <span class="font-bold text-gray-800"> </span></p>`);
var root_6 = $.from_html(`<p>Data and layer configuration derived from <a href="https://maplibre.org/maplibre-gl-js-docs/example/cluster/">MapLibre Cluster Example.</a></p> <fieldset class="mb-2 flex gap-x-4 self-start border border-gray-300 px-2"><legend>Show popup on</legend> <label><input type="radio"/> Hover</label> <label><input type="radio"/> Click</label> <label><input type="radio"/> Double Click</label> <label><input type="radio"/> Context Menu (right-click)</label></fieldset> <!> <!> <!> <!> <footer class="self-start"><p><a class="text-sm" href="https://www.flaticon.com/free-icons/earthquake" title="earthquake icons">Earthquake icons created by Freepik - Flaticon</a></p> <p><a class="text-sm" href="https://www.flaticon.com/free-icons/tsunami" title="tsunami icons">Tsunami icons created by surang - Flaticon</a></p></footer>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let clickedFeature = $.state(void 0);
	let openOn = $.state('hover');
	var fragment = root_6();
	var fieldset = $.sibling($.first_child(fragment), 2);
	var label = $.sibling($.child(fieldset), 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 'hover';
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'click';
	$.next();
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'dblclick';
	$.next();
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.child(label_3);

	$.remove_input_defaults(input_3);
	input_3.value = input_3.__value = 'contextmenu';
	$.next();
	$.reset(label_3);
	$.reset(fieldset);

	var node = $.sibling(fieldset, 2);

	{
		let $0 = $.derived(() => $.get(openOn) !== 'dblclick');

		MapLibre(node, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			get class() {
				return mapClasses;
			},

			get zoomOnDoubleClick() {
				return $.get($0);
			},
			standardControls: true,
			children: ($$anchor, $$slotProps) => {
				GeoJSON($$anchor, {
					id: 'earthquakes',
					get data() {
						return earthquakes;
					},

					cluster: {
						radius: 50,
						maxZoom: 14,
						properties: { total_mag: ['+', ['get', 'mag']] }
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						{
							const children = ($$anchor, $$arg0) => {
								let feature = () => ($$arg0?.()).feature;
								var fragment_3 = root();
								var node_2 = $.sibling($.first_child(fragment_3), 2);

								Popup(node_2, {
									get openOn() {
										return $.get(openOn);
									},
									closeOnClickInside: true,
									children: ($$anchor, $$slotProps) => {
										ClusterPopup($$anchor, {
											get feature() {
												return feature();
											}
										});
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							};

							MarkerLayer(node_1, {
								applyToClusters: true,
								asButton: true,
								onclick: (e) => $.set(clickedFeature, e.feature?.properties, true),
								children,
								$$slots: { default: true }
							});
						}

						var node_3 = $.sibling(node_1, 2);

						{
							const children = ($$anchor, $$arg0) => {
								let feature = () => ($$arg0?.()).feature;
								var fragment_5 = root_2();
								var img = $.first_child(fragment_5);
								var node_4 = $.sibling(img, 2);

								Popup(node_4, {
									get openOn() {
										return $.get(openOn);
									},
									closeOnClickInside: true,
									children: ($$anchor, $$slotProps) => {
										const props = $.derived(() => feature().properties);
										var fragment_6 = root_1();
										var p = $.first_child(fragment_6);
										var span = $.sibling($.child(p));
										var text = $.only_child(span, true);

										$.reset(p);

										var p_1 = $.sibling(p, 2);
										var span_1 = $.sibling($.child(p_1));
										var text_1 = $.only_child(span_1, true);

										$.reset(p_1);

										var p_2 = $.sibling(p_1, 2);
										var span_2 = $.sibling($.child(p_2));
										var text_2 = $.only_child(span_2, true);

										$.reset(p_2);

										$.template_effect(
											($0) => {
												$.set_text(text, $0);
												$.set_text(text_1, $.get(props)?.mag);
												$.set_text(text_2, $.get(props)?.tsunami ? 'Yes' : 'No');
											},
											[() => new Date($.get(props)?.time).toLocaleDateString()]
										);

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});

								$.template_effect(() => $.set_attribute(img, 'src', feature().properties?.tsunami ? tsunamiImageUrl : quakeImageUrl));
								$.append($$anchor, fragment_5);
							};

							MarkerLayer(node_3, {
								applyToClusters: false,
								anchor: 'bottom',
								asButton: true,
								onclick: (e) => $.set(clickedFeature, e.feature?.properties, true),
								children,
								$$slots: { default: true }
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	var node_5 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_6 = $.first_child(fragment_7);

			{
				var consequent = ($$anchor) => {
					var fragment_8 = root_4();
					var p_3 = $.first_child(fragment_8);
					var span_3 = $.sibling($.child(p_3));
					var text_3 = $.only_child(span_3, true);

					$.reset(p_3);

					var p_4 = $.sibling(p_3, 2);
					var span_4 = $.sibling($.child(p_4));
					var text_4 = $.only_child(span_4, true);

					$.reset(p_4);

					$.template_effect(
						($0) => {
							$.set_text(text_3, $.get(clickedFeature)['point_count']);
							$.set_text(text_4, $0);
						},
						[
							() => ($.get(clickedFeature).total_mag / $.get(clickedFeature).point_count).toFixed(2)
						]
					);

					$.append($$anchor, fragment_8);
				};

				var alternate = ($$anchor) => {
					var p_5 = root_5();
					var span_5 = $.sibling($.child(p_5));
					var text_5 = $.only_child(span_5, true);

					$.reset(p_5);
					$.template_effect(() => $.set_text(text_5, $.get(clickedFeature).mag));
					$.append($$anchor, p_5);
				};

				$.if(node_6, ($$render) => {
					if ($.get(clickedFeature).cluster) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_7);
		};

		$.if(node_5, ($$render) => {
			if ($.get(clickedFeature)) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	CodeSample(node_7, {
		get code() {
			return code;
		},
		endBoundary: '<CodeSample',
		omitEndBoundary: true
	});

	var node_8 = $.sibling(node_7, 2);

	CodeSample(node_8, {
		get code() {
			return clusterPopupCode;
		},
		filename: 'ClusterPopup.svelte',
		startBoundary: '',
		endBoundary: ''
	});

	$.next(2);
	$.bind_group(binding_group, [], input, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_3, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.append($$anchor, fragment);
	$.pop();
}