import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

var root = $.from_html(`<p class="tabular-nums"> </p> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let bounds = $.state($.proxy([-32, -8, 63, 41]));
	let displayBounds = $.derived(() => $.get(bounds).map((b) => b.toFixed(4)).join(', '));
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		standardControls: true,
		get bounds() {
			return $.get(bounds);
		},

		set bounds($$value) {
			$.set(bounds, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		},
		endBoundary: '/>',
		omitStartBoundary: false,
		omitEndBoundary: false
	});

	$.template_effect(() => $.set_text(text, `Bounds: ${$.get(displayBounds) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}