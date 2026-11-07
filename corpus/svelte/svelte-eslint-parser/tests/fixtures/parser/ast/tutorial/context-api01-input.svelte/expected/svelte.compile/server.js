import * as $ from 'svelte/internal/server';
import Map from './Map.svelte';
import MapMarker from './MapMarker.svelte';

export default function Context_api01_input($$renderer) {
	Map($$renderer, {
		lat: 35,
		lon: -84,
		zoom: 3.5,
		children: ($$renderer) => {
			MapMarker($$renderer, { lat: 37.8225, lon: -122.0024, label: 'Svelte Body Shaping' });
			$$renderer.push(`<!----> `);

			MapMarker($$renderer, {
				lat: 33.8981,
				lon: -118.4169,
				label: 'Svelte Barbershop & Essentials'
			});

			$$renderer.push(`<!----> `);
			MapMarker($$renderer, { lat: 29.7230, lon: -95.4189, label: 'Svelte Waxing Studio' });
			$$renderer.push(`<!----> `);

			MapMarker($$renderer, {
				lat: 28.3378,
				lon: -81.3966,
				label: 'Svelte 30 Nutritional Consultants'
			});

			$$renderer.push(`<!----> `);
			MapMarker($$renderer, { lat: 40.6483, lon: -74.0237, label: 'Svelte Brands LLC' });
			$$renderer.push(`<!----> `);
			MapMarker($$renderer, { lat: 40.6986, lon: -74.4100, label: 'Svelte Medical Systems' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}