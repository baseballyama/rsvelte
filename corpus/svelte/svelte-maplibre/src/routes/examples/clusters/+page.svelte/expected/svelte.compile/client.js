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
import Popup from '$lib/Popup.svelte';
import ClusterPopup from '../ClusterPopup.svelte';
import clusterPopupCode from '../ClusterPopup.svelte?raw';
import earthquakes from '$site/earthquakes.geojson?url';

var root = $.from_html(`<p>Date: <span class="font-medium text-gray-800"> </span></p> <p>Magnitude: <span class="font-medium text-gray-800"> </span></p> <p>Tsunami: <span class="font-medium text-gray-800"> </span></p>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<p>Number of Earthquakes: <span class="font-bold text-gray-800"> </span></p> <p>Average Magnitude: <span class="font-bold text-gray-800"> </span></p>`, 1);
var root_3 = $.from_html(`<p>Magnitude: <span class="font-bold text-gray-800"> </span></p>`);
var root_4 = $.from_html(`<p>Data and layer configuration derived from <a href="https://maplibre.org/maplibre-gl-js-docs/example/cluster/">MapLibre cluster Example.</a></p> <fieldset class="mb-2 flex gap-x-4 self-start border border-gray-300 px-2"><legend>Show popup on</legend> <label><input type="radio"/> Hover</label> <label><input type="radio"/> Click</label> <label><input type="radio"/> Double Click</label> <label><input type="radio"/> Context Menu (right-click)</label></fieldset> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let clickedFeature = $.state(void 0);
	let openOn = $.state('hover');
	var fragment = root_4();
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
						var fragment_2 = root_1();
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
								id: 'cluster_circles',
								applyToClusters: true,
								hoverCursor: 'pointer',
								get paint() {
									return $.get($0);
								},
								manageHoverState: true,
								onclick: (e) => $.set(clickedFeature, e.features?.[0]?.properties, true),
								children: ($$anchor, $$slotProps) => {
									{
										const children = ($$anchor, $$arg0) => {
											let data = () => ($$arg0?.()).data;

											{
												let $0 = $.derived(() => data() ?? undefined);

												ClusterPopup($$anchor, {
													get feature() {
														return $.get($0);
													}
												});
											}
										};

										Popup($$anchor, {
											get openOn() {
												return $.get(openOn);
											},
											closeOnClickInside: true,
											children,
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						}

						var node_2 = $.sibling(node_1, 2);

						SymbolLayer(node_2, {
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

						var node_3 = $.sibling(node_2, 2);

						CircleLayer(node_3, {
							id: 'earthquakes_circle',
							applyToClusters: false,
							hoverCursor: 'pointer',
							paint: {
								'circle-color': '#11b4da',
								'circle-radius': 4,
								'circle-stroke-width': 1,
								'circle-stroke-color': '#fff'
							},
							onclick: (e) => $.set(clickedFeature, e.features?.[0]?.properties, true),
							children: ($$anchor, $$slotProps) => {
								{
									const children = ($$anchor, $$arg0) => {
										let data = () => ($$arg0?.()).data;
										const props = $.derived(() => data()?.properties);
										var fragment_6 = $.comment();
										var node_4 = $.first_child(fragment_6);

										{
											var consequent = ($$anchor) => {
												var fragment_7 = root();
												var p = $.first_child(fragment_7);
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
														$.set_text(text_1, $.get(props).mag);
														$.set_text(text_2, $.get(props).tsunami ? 'Yes' : 'No');
													},
													[() => new Date($.get(props).time).toLocaleDateString()]
												);

												$.append($$anchor, fragment_7);
											};

											$.if(node_4, ($$render) => {
												if ($.get(props)) $$render(consequent);
											});
										}

										$.append($$anchor, fragment_6);
									};

									Popup($$anchor, {
										get openOn() {
											return $.get(openOn);
										},
										closeOnClickInside: true,
										children,
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});

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
		var consequent_2 = ($$anchor) => {
			var fragment_8 = $.comment();
			var node_6 = $.first_child(fragment_8);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_9 = root_2();
					var p_3 = $.first_child(fragment_9);
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

					$.append($$anchor, fragment_9);
				};

				var alternate = ($$anchor) => {
					var p_5 = root_3();
					var span_5 = $.sibling($.child(p_5));
					var text_5 = $.only_child(span_5, true);

					$.reset(p_5);
					$.template_effect(() => $.set_text(text_5, $.get(clickedFeature).mag));
					$.append($$anchor, p_5);
				};

				$.if(node_6, ($$render) => {
					if ($.get(clickedFeature).cluster) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_8);
		};

		$.if(node_5, ($$render) => {
			if ($.get(clickedFeature)) $$render(consequent_2);
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

	$.bind_group(binding_group, [], input, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_3, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.append($$anchor, fragment);
	$.pop();
}