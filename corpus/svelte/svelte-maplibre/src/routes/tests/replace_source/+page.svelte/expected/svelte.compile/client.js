import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MapLibre, GeoJSON, LineLayer, FillLayer, Marker } from '$lib/index.js';
import { onMount } from 'svelte';

var root = $.from_html(`<p>Should see the box cycle between large, small, and absent.</p> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const lngLat = [174.863783, -36.871099];
	let size = $.state(20);

	onMount(() => {
		let timeout = setInterval(
			() => {
				switch ($.get(size)) {
					case 20:
						$.set(size, 10);
						break;

					case 10:
						$.set(size, 0);
						break;

					case 0:
						$.set(size, 20);
						break;
				}
			},
			2000
		);

		return () => clearInterval(timeout);
	});

	let data = $.derived(() => $.get(size) === 0
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
								[$.get(size), $.get(size)],
								[-$.get(size), $.get(size)],
								[-$.get(size), -$.get(size)],
								[$.get(size), -$.get(size)],
								[$.get(size), $.get(size)]
							]
						]
					}
				}
			]
		});

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	MapLibre(node, {
		standardControls: true,
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		center: [0, 0],
		zoom: 3,
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.key(node_2, () => $.get(data), ($$anchor) => {
						GeoJSON($$anchor, {
							id: 'layer_1',
							get data() {
								return $.get(data);
							},

							children: ($$anchor, $$slotProps) => {
								LineLayer($$anchor, {
									layout: { 'line-cap': 'round', 'line-join': 'round' },
									paint: { 'line-color': 'black', 'line-width': 3 }
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(data)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}