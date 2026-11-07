import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Map from './Map.svelte';
import MapMarker from './MapMarker.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Context_api01_input($$anchor) {
	Map($$anchor, {
		lat: 35,
		lon: -84,
		zoom: 3.5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			MapMarker(node, { lat: 37.8225, lon: -122.0024, label: 'Svelte Body Shaping' });

			var node_1 = $.sibling(node, 2);

			MapMarker(node_1, {
				lat: 33.8981,
				lon: -118.4169,
				label: 'Svelte Barbershop & Essentials'
			});

			var node_2 = $.sibling(node_1, 2);

			MapMarker(node_2, { lat: 29.7230, lon: -95.4189, label: 'Svelte Waxing Studio' });

			var node_3 = $.sibling(node_2, 2);

			MapMarker(node_3, {
				lat: 28.3378,
				lon: -81.3966,
				label: 'Svelte 30 Nutritional Consultants'
			});

			var node_4 = $.sibling(node_3, 2);

			MapMarker(node_4, { lat: 40.6483, lon: -74.0237, label: 'Svelte Brands LLC' });

			var node_5 = $.sibling(node_4, 2);

			MapMarker(node_5, { lat: 40.6986, lon: -74.4100, label: 'Svelte Medical Systems' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}