import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import Popup from '$lib/Popup.svelte';

var root = $.from_html(`<p>The popup should appear and say Hello!</p> <!> <!>`, 1);

export default function _page($$anchor) {
	const features = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: {},
				geometry: { type: 'Point', coordinates: [0, 0] }
			}
		]
	};

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		center: [0, 0],
		zoom: 2,
		standardControls: true,
		children: ($$anchor, $$slotProps) => {
			Popup($$anchor, {
				lngLat: [0, 0],
				open: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Hello!');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		}
	});

	$.append($$anchor, fragment);
}