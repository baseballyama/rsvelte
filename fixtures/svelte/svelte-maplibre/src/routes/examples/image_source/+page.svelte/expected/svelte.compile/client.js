import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import MapLibre from '$lib/MapLibre.svelte';
import { mapClasses } from '../styles';
import ImageSource from '$lib/ImageSource.svelte';
import RasterLayer from '$lib/RasterLayer.svelte';
import Marker from '$lib/Marker.svelte';
import quakeImageUrl from '$site/earthquake.png';

var root = $.from_html(`<span class="dot svelte-1mdetuc"></span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="mx-auto mb-2 flex flex-col items-start gap-1"><label>Opacity: <input type="range"/></label></div> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let topLeft = $.state($.proxy({ lng: -49.0, lat: 1.9 }));
	let bottomRight = $.state($.proxy({ lng: -73.6, lat: -17.9 }));
	let opacity = $.state(80);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'max', 100);
	$.reset(label);
	$.reset(div);

	var node = $.sibling(div, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => [
					[$.get(topLeft).lng, $.get(topLeft).lat],
					[$.get(bottomRight).lng, $.get(topLeft).lat],
					[$.get(bottomRight).lng, $.get(bottomRight).lat],
					[$.get(topLeft).lng, $.get(bottomRight).lat]
				]);

				ImageSource(node_1, {
					get url() {
						return quakeImageUrl;
					},

					get coordinates() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => ({
								'raster-fade-duration': 0,
								'raster-opacity': $.get(opacity) / 100.0
							}));

							RasterLayer($$anchor, {
								get paint() {
									return $.get($0);
								}
							});
						}
					},
					$$slots: { default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			Marker(node_2, {
				draggable: true,
				get lngLat() {
					return $.get(topLeft);
				},

				set lngLat($$value) {
					$.set(topLeft, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Marker(node_3, {
				draggable: true,
				get lngLat() {
					return $.get(bottomRight);
				},

				set lngLat($$value) {
					$.set(bottomRight, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var span_1 = root();

					$.append($$anchor, span_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	CodeSample(node_4, {
		get code() {
			return code;
		}
	});

	$.bind_value(input, () => $.get(opacity), ($$value) => $.set(opacity, $$value));
	$.append($$anchor, fragment);
	$.pop();
}