import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

var root = $.from_html(`<button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Toggle Projection</button> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let projection = $.state('globe');

	function toggleProjection() {
		$.set(projection, $.get(projection) === 'globe' ? 'mercator' : 'globe', true);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		let $0 = $.derived(() => ({ type: $.get(projection) }));

		MapLibre(node, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
			standardControls: true,
			get projection() {
				return $.get($0);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		}
	});

	$.delegated('click', button, toggleProjection);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);