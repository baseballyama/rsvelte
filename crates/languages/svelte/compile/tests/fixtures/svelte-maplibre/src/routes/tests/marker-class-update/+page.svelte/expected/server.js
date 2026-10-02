import * as $ from 'svelte/internal/server';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import states from '$site/states.json?url';
import MarkerLayer from '$lib/MarkerLayer.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';

export default function _page($$renderer) {
	let colors = [
		'bg-gray-200 text-gray-800',
		'bg-red-200 text-red-800',
		'bg-teal-200 text-teal-800'
	];

	function swapColor() {
		colors = [...colors.slice(1), colors[0]];
	}

	$$renderer.push(`<button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Cycle Color</button> `);

	MapLibre($$renderer, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		center: [-98.137, 40.137],
		zoom: 4,
		standardControls: true,
		children: ($$renderer) => {
			GeoJSON($$renderer, {
				id: 'states',
				data: states,
				promoteId: 'STATEFP',
				children: ($$renderer) => {
					{
						function children($$renderer, { feature }) {
							$$renderer.push(`<div class="text-sm font-bold">${$.escape(feature.properties?.NAME)}</div>`);
						}

						MarkerLayer($$renderer, {
							draggable: true,
							class: `rounded-full p-2 shadow ${$.stringify(colors[0])}`,
							children,
							$$slots: { default: true }
						});
					}
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