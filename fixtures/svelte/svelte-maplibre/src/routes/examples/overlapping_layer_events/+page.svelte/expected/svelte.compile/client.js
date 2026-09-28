import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import GeoJson from '$lib/GeoJSON.svelte';
import CircleLayer from '$lib/CircleLayer.svelte';
import { hoverStateFilter } from '$lib/filters';
import Popup from '$lib/Popup.svelte';

var root = $.from_html(`<span class="flex-none"> </span> <span class="w-64"> </span>`, 1);
var root_1 = $.from_html(`<p>extra padding for lowest red layer</p> <p>extra padding for lowest red layer</p>`, 1);
var root_2 = $.from_html(`<p>extra padding for middle green layer</p>`);
var root_3 = $.from_html(`<div><p> </p> <!> <!></div>`);
var root_4 = $.from_html(`<div class="mx-auto mb-2 flex flex-col items-start gap-1"><label><input type="checkbox"/> When layers overlap, only fire events for top-most layer</label> <label><input type="checkbox"/> When layers overlap, only activate the popup for top-most layer</label> <fieldset class="flex gap-x-4"><legend>Show popup on</legend> <label><input type="radio"/> Hover</label> <label><input type="radio"/> Click</label> <label><input type="radio"/> Double Click</label> <label><input type="radio"/> Context Menu (right-click)</label></fieldset> <fieldset class="flex gap-4"><legend>Allow popup on</legend> <label><input type="radio"/> All Colors</label> <label><input type="radio"/> Only Red</label> <label><input type="radio"/> Only Green</label> <label><input type="radio"/> Only Blue</label></fieldset> <div class="grid grid-cols-[auto_1fr] gap-x-2"></div></div> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

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

	const lastEvent = $.proxy([]);

	function labelFeature(f) {
		if (!f) {
			return 'None';
		}

		return f.geometry.coordinates.map((c) => c.toFixed(4)).join(' ,');
	}

	let eventsIfTopMost = $.state(true);
	let openIfTopMost = $.state(true);
	let openOn = $.state('hover');
	let allowOn = $.state('all');
	var fragment = root_4();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_1);

	var fieldset = $.sibling(label_1, 2);
	var label_2 = $.sibling($.child(fieldset), 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'hover';
	$.next();
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.child(label_3);

	$.remove_input_defaults(input_3);
	input_3.value = input_3.__value = 'click';
	$.next();
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var input_4 = $.child(label_4);

	$.remove_input_defaults(input_4);
	input_4.value = input_4.__value = 'dblclick';
	$.next();
	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var input_5 = $.child(label_5);

	$.remove_input_defaults(input_5);
	input_5.value = input_5.__value = 'contextmenu';
	$.next();
	$.reset(label_5);
	$.reset(fieldset);

	var fieldset_1 = $.sibling(fieldset, 2);
	var label_6 = $.sibling($.child(fieldset_1), 2);
	var input_6 = $.child(label_6);

	$.remove_input_defaults(input_6);
	input_6.value = input_6.__value = 'all';
	$.next();
	$.reset(label_6);

	var label_7 = $.sibling(label_6, 2);
	var input_7 = $.child(label_7);

	$.remove_input_defaults(input_7);
	input_7.value = input_7.__value = 'red';
	$.next();
	$.reset(label_7);

	var label_8 = $.sibling(label_7, 2);
	var input_8 = $.child(label_8);

	$.remove_input_defaults(input_8);
	input_8.value = input_8.__value = 'green';
	$.next();
	$.reset(label_8);

	var label_9 = $.sibling(label_8, 2);
	var input_9 = $.child(label_9);

	$.remove_input_defaults(input_9);
	input_9.value = input_9.__value = 'blue';
	$.next();
	$.reset(label_9);
	$.reset(fieldset_1);

	var div_1 = $.sibling(fieldset_1, 2);

	$.each(div_1, 21, () => layers, $.index, ($$anchor, layer, i) => {
		var fragment_1 = root();
		var span = $.first_child(fragment_1);
		var text = $.only_child(span);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.template_effect(
			($0) => {
				$.set_text(text, `Last Event for ${$.get(layer).color ?? ''} layer:`);
				$.set_text(text_1, $0);
			},
			[() => labelFeature(lastEvent[i])]
		);

		$.append($$anchor, fragment_1);
	});

	$.reset(div_1);
	$.reset(div);

	var node = $.sibling(div, 2);

	{
		let $0 = $.derived(() => $.get(openOn) !== 'dblclick');

		MapLibre(node, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
			standardControls: true,
			get zoomOnDoubleClick() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				$.each(node_1, 17, () => layers, $.index, ($$anchor, $$item, i) => {
					let data = () => $.get($$item).data;
					let color = () => $.get($$item).color;
					let hoverCursor = () => $.get($$item).hoverCursor;

					{
						let $0 = $.derived(() => ({ type: 'FeatureCollection', features: data() }));

						GeoJson($$anchor, {
							id: `layer${i + 1}`,
							get data() {
								return $.get($0);
							},
							generateId: true,
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => ({
										'circle-color': color(),
										'circle-radius': ['get', 'radius'],
										'circle-opacity': hoverStateFilter(1.0, 0.5)
									}));

									CircleLayer($$anchor, {
										get eventsIfTopMost() {
											return $.get(eventsIfTopMost);
										},
										manageHoverState: true,
										get hoverCursor() {
											return hoverCursor();
										},

										get paint() {
											return $.get($0);
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

										children: ($$anchor, $$slotProps) => {
											{
												const children = ($$anchor, $$arg0) => {
													let features = () => ($$arg0?.()).features;
													var div_2 = root_3();
													let styles;
													var p = $.child(div_2);
													var text_2 = $.only_child(p);
													var node_2 = $.sibling(p, 2);

													{
														var consequent = ($$anchor) => {
															var fragment_6 = root_1();

															$.next(2);
															$.append($$anchor, fragment_6);
														};

														$.if(node_2, ($$render) => {
															if (color() == 'red') $$render(consequent);
														});
													}

													var node_3 = $.sibling(node_2, 2);

													{
														var consequent_1 = ($$anchor) => {
															var p_1 = root_2();

															$.append($$anchor, p_1);
														};

														$.if(node_3, ($$render) => {
															if (color() == 'green') $$render(consequent_1);
														});
													}

													$.reset(div_2);

													$.template_effect(() => {
														styles = $.set_style(div_2, '', styles, { background: color(), color: 'white' });
														$.set_text(text_2, `${features()?.length ?? ''} features from ${color() ?? ''} layer`);
													});

													$.append($$anchor, div_2);
												};

												Popup($$anchor, {
													get openOn() {
														return $.get(openOn);
													},

													get openIfTopMost() {
														return $.get(openIfTopMost);
													},
													canOpen: (features) => $.get(allowOn) === 'all' || features?.[0]?.properties?.color === $.get(allowOn),
													children,
													$$slots: { default: true }
												});
											}
										},
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					}
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	}

	var node_4 = $.sibling(node, 2);

	CodeSample(node_4, {
		get code() {
			return code;
		}
	});

	$.bind_checked(input, () => $.get(eventsIfTopMost), ($$value) => $.set(eventsIfTopMost, $$value));
	$.bind_checked(input_1, () => $.get(openIfTopMost), ($$value) => $.set(openIfTopMost, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_3, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_4, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group, [], input_5, () => $.get(openOn), ($$value) => $.set(openOn, $$value));
	$.bind_group(binding_group_1, [], input_6, () => $.get(allowOn), ($$value) => $.set(allowOn, $$value));
	$.bind_group(binding_group_1, [], input_7, () => $.get(allowOn), ($$value) => $.set(allowOn, $$value));
	$.bind_group(binding_group_1, [], input_8, () => $.get(allowOn), ($$value) => $.set(allowOn, $$value));
	$.bind_group(binding_group_1, [], input_9, () => $.get(allowOn), ($$value) => $.set(allowOn, $$value));
	$.append($$anchor, fragment);
	$.pop();
}