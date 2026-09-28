import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p>A deck.gl ArcLayer integrated into a MapLibre map, with hover and popup support.</p> <fieldset class="mb-2 self-start border border-gray-400 p-2"><legend>View Mode</legend> <div class="flex flex-wrap gap-2"><label><input type="radio"/> Show county arcs for hovered state</label> <label><input type="radio"/> Show state arcs</label></div></fieldset> <!> <h4><!></h4> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

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

	let zoom = $.state(3);
	let hovered = $.state(void 0);
	let mode = $.state('showOne');
	let arcs = $.derived(() => calculateArcs($.get(mode) === 'showAll' ? states : counties));
	let activeState = $.state('');

	$.user_pre_effect(() => {
		$.set(activeState, $.get(arcs)[0].fromState, true);
	});

	var fragment = root_1();
	var fieldset = $.sibling($.first_child(fragment), 2);
	var div = $.sibling($.child(fieldset), 2);
	var label = $.child(div);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 'showOne';
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'showAll';
	$.next();
	$.reset(label_1);
	$.reset(div);
	$.reset(fieldset);

	var node = $.sibling(fieldset, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		pitch: 30,
		center: [-100, 40],
		maxZoom: 5,
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		standardControls: true,
		get zoom() {
			return $.get(zoom);
		},

		set zoom($$value) {
			$.set(zoom, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			GeoJson(node_1, {
				id: 'states-base',
				get data() {
					return states;
				},
				promoteId: 'GEOID',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => ({
							'fill-color': '#000',
							'fill-opacity': $.get(mode) === 'showOne' ? hoverStateFilter(0, 0.1) : 0
						}));

						FillLayer($$anchor, {
							id: 'counties-click',
							hoverCursor: 'pointer',
							get paint() {
								return $.get($0);
							},
							manageHoverState: true,
							onmousemove: (e) => {
								if ($.get(mode) === 'showOne') {
									let newGeoId = e.features[0]?.properties?.STATEFP;

									if (newGeoId !== $.get(activeState)) {
										$.set(activeState, newGeoId, true);
										$.set(hovered, undefined);
									}
								}
							}
						});
					}
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => $.get(arcs).filter((a, i) => {
					if ($.get(mode) === 'showAll') return i < 50000;

					return a.fromState === $.get(activeState) || a.toState === $.get(activeState);
				}));

				let $1 = $.derived(() => $.get(mode) === 'showAll');
				let $2 = $.derived(() => $.get(mode) === 'showAll' ? 5 : 1);
				let $3 = $.derived(() => clamp(3 / $.get(zoom), 0, 1));

				DeckGlLayer(node_2, {
					get type() {
						return ArcLayer;
					},

					get data() {
						return $.get($0);
					},
					getSourcePosition: (d) => d.source,
					getTargetPosition: (d) => d.target,
					getSourceColor: (d) => d.sourceColor,
					getTargetColor: (d) => d.targetColor,
					get autoHighlight() {
						return $.get($1);
					},
					highlightColor: [30, 255, 30],
					get getWidth() {
						return $.get($2);
					},

					get getHeight() {
						return $.get($3);
					},

					get hovered() {
						return $.get(hovered);
					},

					set hovered($$value) {
						$.set(hovered, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						{
							const children = ($$anchor, $$arg0) => {
								let data = () => ($$arg0?.()).data;
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										var text = $.text();

										$.template_effect(() => $.set_text(text, `From ${data().fromName ?? ''} to ${data().toName ?? ''}`));
										$.append($$anchor, text);
									};

									$.if(node_3, ($$render) => {
										if (data()) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_4);
							};

							Popup($$anchor, { openOn: 'click', children, $$slots: { default: true } });
						}
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var h4 = $.sibling(node, 2);
	var node_4 = $.child(h4);

	{
		var consequent_1 = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `From ${$.get(hovered).fromName ?? ''} to ${$.get(hovered).toName ?? ''}`));
			$.append($$anchor, text_1);
		};

		var consequent_2 = ($$anchor) => {
			var text_2 = $.text();

			$.template_effect(($0) => $.set_text(text_2, $0), [
				() => states.features.find((f) => f.properties.STATEFP === $.get(activeState))?.properties.NAME
			]);

			$.append($$anchor, text_2);
		};

		var alternate = ($$anchor) => {
			var text_3 = $.text('Hover over an arc to see its endpoints');

			$.append($$anchor, text_3);
		};

		$.if(node_4, ($$render) => {
			if ($.get(hovered) && $.get(mode) === 'showAll') $$render(consequent_1); else if ($.get(mode) === 'showOne') $$render(consequent_2, 1); else $$render(alternate, -1);
		});
	}

	$.reset(h4);

	var node_5 = $.sibling(h4, 2);

	CodeSample(node_5, {
		get code() {
			return code;
		}
	});

	$.bind_group(binding_group, [], input, () => $.get(mode), ($$value) => $.set(mode, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(mode), ($$value) => $.set(mode, $$value));
	$.append($$anchor, fragment);
	$.pop();
}