import * as $ from 'svelte/internal/server';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

export default function _page($$renderer) {
	let coords = [
		{ center: [116, -34], zoom: 8, pitch: 30, bearing: 30 },
		{ center: [-107, 40], zoom: 3, pitch: 0, bearing: 210 }
	];

	let center = coords[0].center;
	let zoom = coords[0].zoom;
	let bearing = coords[0].bearing;
	let pitch = coords[0].pitch;
	let currentIndex = 0;

	function toggle() {
		currentIndex = (currentIndex + 1) % coords.length;

		const {
			center: newCenter,
			zoom: newZoom,
			bearing: newBearing,
			pitch: newPitch
		} = coords[currentIndex];

		center = newCenter;
		zoom = newZoom;
		bearing = newBearing;
		pitch = newPitch;
	}

	function quickToggle() {
		toggle();
		setTimeout(() => toggle(), 200);
	}

	let currentCoords = coords[0].center;
	let currentZoom = coords[0].zoom;
	let currentBearing = coords[0].bearing;
	let currentPitch = coords[0].pitch;

	function handleMoveEnd(ev) {
		const map = ev.target;
		let center = map.getCenter();

		currentCoords = [center.lng, center.lat];
		currentZoom = map.getZoom();
		currentBearing = map.getBearing();
		currentPitch = map.getPitch();
	}

	$$renderer.push(`<div class="flex gap-4"><div class="flex gap-4"><button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Toggle</button> <button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Toggle and Back</button></div> <div>${$.escape(
		// when working correctly, the Toggle button should successfully change all the values, and Quick Toggle should end up
		// back at the current coordinates.
		currentCoords[0].toFixed(3)
	)}, ${$.escape(currentCoords[1].toFixed(3))} @ ${$.escape(currentZoom)}, ${$.escape(currentBearing)}/${$.escape(currentPitch)}</div></div> `);

	MapLibre($$renderer, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		onmoveend: handleMoveEnd,
		bearing,
		pitch,
		center,
		zoom,
		standardControls: true
	});

	$$renderer.push(`<!----> `);
	CodeSample($$renderer, { code });
	$$renderer.push(`<!---->`);
}