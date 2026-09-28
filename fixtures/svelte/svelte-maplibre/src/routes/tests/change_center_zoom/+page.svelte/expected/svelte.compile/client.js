import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

var root = $.from_html(`<div class="flex gap-4"><div class="flex gap-4"><button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Toggle</button> <button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Toggle and Back</button></div> <div> </div></div> <!> <!>`, 1);

export default function _page($$anchor) {
	let coords = [
		{ center: [116, -34], zoom: 8, pitch: 30, bearing: 30 },
		{ center: [-107, 40], zoom: 3, pitch: 0, bearing: 210 }
	];

	let center = $.state($.proxy(coords[0].center));
	let zoom = $.state($.proxy(coords[0].zoom));
	let bearing = $.state($.proxy(coords[0].bearing));
	let pitch = $.state($.proxy(coords[0].pitch));
	let currentIndex = 0;

	function toggle() {
		currentIndex = (currentIndex + 1) % coords.length;

		const {
			center: newCenter,
			zoom: newZoom,
			bearing: newBearing,
			pitch: newPitch
		} = coords[currentIndex];

		$.set(center, newCenter, true);
		$.set(zoom, newZoom, true);
		$.set(bearing, newBearing, true);
		$.set(pitch, newPitch, true);
	}

	function quickToggle() {
		toggle();
		setTimeout(() => toggle(), 200);
	}

	let currentCoords = $.state($.proxy(coords[0].center));
	let currentZoom = $.state($.proxy(coords[0].zoom));
	let currentBearing = $.state($.proxy(coords[0].bearing));
	let currentPitch = $.state($.proxy(coords[0].pitch));

	function handleMoveEnd(ev) {
		const map = ev.target;
		let center = map.getCenter();

		$.set(currentCoords, [center.lng, center.lat], true);
		$.set(currentZoom, map.getZoom(), true);
		$.set(currentBearing, map.getBearing(), true);
		$.set(currentPitch, map.getPitch(), true);
	}

	var fragment = root();

	var // when working correctly, the Toggle button should successfully change all the values, and Quick Toggle should end up
	// back at the current coordinates.
	div = $.first_child(fragment);

	var div_1 = $.child(div);
	var button = $.child(div_1);
	var button_1 = $.sibling(button, 2);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var text = $.only_child(div_2);

	$.reset(div);

	var node = $.sibling(div, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		onmoveend: handleMoveEnd,
		get bearing() {
			return $.get(bearing);
		},

		get pitch() {
			return $.get(pitch);
		},

		get center() {
			return $.get(center);
		},

		get zoom() {
			return $.get(zoom);
		},
		standardControls: true
	});

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		}
	});

	$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}, ${$1 ?? ''} @ ${$.get(currentZoom) ?? ''}, ${$.get(currentBearing) ?? ''}/${$.get(currentPitch) ?? ''}`), [
		() => $.get(currentCoords)[0].toFixed(3),
		() => $.get(currentCoords)[1].toFixed(3)
	]);

	$.delegated('click', button, toggle);
	$.delegated('click', button_1, quickToggle);
	$.append($$anchor, fragment);
}

$.delegate(['click']);