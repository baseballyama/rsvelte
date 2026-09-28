import * as $ from 'svelte/internal/server';
import { MapLibre, GeoJSON, LineLayer, FillLayer, Marker } from '$lib/index.js';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const lngLat = [174.863783, -36.871099];
		let size = 20;

		onMount(() => {
			let timeout = setInterval(
				() => {
					switch (size) {
						case 20:
							size = 10;
							break;

						case 10:
							size = 0;
							break;

						case 0:
							size = 20;
							break;
					}
				},
				2000
			);

			return () => clearInterval(timeout);
		});

		let data = $.derived(() => size === 0
			? undefined
			: {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'Polygon',
							coordinates: [
								[
									[size, size],
									[-size, size],
									[-size, -size],
									[size, -size],
									[size, size]
								]
							]
						}
					}
				]
			});

		$$renderer.push(`<p>Should see the box cycle between large, small, and absent.</p> `);

		MapLibre($$renderer, {
			standardControls: true,
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			center: [0, 0],
			zoom: 3,
			class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
			children: ($$renderer) => {
				if (data()) {
					$$renderer.push(`<!--[0--><!---->`);

					{
						GeoJSON($$renderer, {
							id: 'layer_1',
							data: data(),
							children: ($$renderer) => {
								LineLayer($$renderer, {
									layout: { 'line-cap': 'round', 'line-join': 'round' },
									paint: { 'line-color': 'black', 'line-width': 3 }
								});
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}