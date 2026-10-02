import * as $ from 'svelte/internal/server';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import Popup from '$lib/Popup.svelte';

export default function _page($$renderer) {
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

	$$renderer.push(`<p>The popup should appear and say Hello!</p> `);

	MapLibre($$renderer, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		center: [0, 0],
		zoom: 2,
		standardControls: true,
		children: ($$renderer) => {
			Popup($$renderer, {
				lngLat: [0, 0],
				open: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Hello!`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	CodeSample($$renderer, { code });
	$$renderer.push(`<!---->`);
}