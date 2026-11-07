import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import Control from '$lib/Control.svelte';
import ControlGroup from '$lib/ControlGroup.svelte';
import ControlButton from '$lib/ControlButton.svelte';
import NavigationControl from '$lib/NavigationControl.svelte';
import GeolocateControl from '$lib/GeolocateControl.svelte';
import AttributionControl from '$lib/AttributionControl.svelte';
import ScaleControl from '$lib/ScaleControl.svelte';
import FullscreenControl from '$lib/FullscreenControl.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<p>Click the controls in the upper right corner to fly to a location.</p> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 2);

	{
		const children = ($$anchor, $$arg0) => {
			let map = () => ($$arg0?.()).map;
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			NavigationControl(node_1, { position: 'top-left' });

			var node_2 = $.sibling(node_1, 2);

			GeolocateControl(node_2, { position: 'top-left', fitBoundsOptions: { maxZoom: 12 } });

			var node_3 = $.sibling(node_2, 2);

			FullscreenControl(node_3, { position: 'top-left' });

			var node_4 = $.sibling(node_3, 2);

			ScaleControl(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			AttributionControl(node_5, {
				customAttribution: `A <strong class="text-red-500">custom</strong> attribution`
			});

			var node_6 = $.sibling(node_5, 2);

			Control(node_6, {
				class: 'flex flex-col gap-y-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_7 = $.first_child(fragment_2);

					ControlGroup(node_7, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_8 = $.first_child(fragment_3);

							ControlButton(node_8, {
								onclick: () => {
									map().flyTo({ center: [-5, 54], zoom: 4 });
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('UK');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							ControlButton(node_9, {
								onclick: () => map().fitBounds([[-120, 50], [-70, 20]]),
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('US');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							ControlButton(node_10, {
								onclick: () => map().fitBounds([[110, 20], [140, 0]]),
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('PH');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_7, 2);

					ControlGroup(node_11, {
						children: ($$anchor, $$slotProps) => {
							ControlButton($$anchor, {
								onclick: () => alert('!'),
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('!');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		MapLibre(node, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			get class() {
				return mapClasses;
			},
			center: [-120, 50],
			zoom: 2,
			attributionControl: false,
			children,
			$$slots: { default: true }
		});
	}

	var node_12 = $.sibling(node, 2);

	CodeSample(node_12, {
		get code() {
			return code;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}