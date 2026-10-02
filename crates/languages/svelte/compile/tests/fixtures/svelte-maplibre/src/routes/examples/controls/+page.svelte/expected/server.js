import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import Control from '$lib/Control.svelte';
import ControlGroup from '$lib/ControlGroup.svelte';
import ControlButton from '$lib/ControlButton.svelte';
import NavigationControl from '$lib/NavigationControl.svelte';
import GeolocateControl from '$lib/GeolocateControl.svelte';
import AttributionControl from '$lib/AttributionControl.svelte';
import ScaleControl from '$lib/ScaleControl.svelte';
import FullscreenControl from '$lib/FullscreenControl.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);
		$$renderer.push(`<p>Click the controls in the upper right corner to fly to a location.</p> `);

		{
			function children($$renderer, { map }) {
				NavigationControl($$renderer, { position: 'top-left' });
				$$renderer.push(`<!----> `);
				GeolocateControl($$renderer, { position: 'top-left', fitBoundsOptions: { maxZoom: 12 } });
				$$renderer.push(`<!----> `);
				FullscreenControl($$renderer, { position: 'top-left' });
				$$renderer.push(`<!----> `);
				ScaleControl($$renderer, {});
				$$renderer.push(`<!----> `);

				AttributionControl($$renderer, {
					customAttribution: `A <strong class="text-red-500">custom</strong> attribution`
				});

				$$renderer.push(`<!----> `);

				Control($$renderer, {
					class: 'flex flex-col gap-y-2',
					children: ($$renderer) => {
						ControlGroup($$renderer, {
							children: ($$renderer) => {
								ControlButton($$renderer, {
									onclick: () => {
										map.flyTo({ center: [-5, 54], zoom: 4 });
									},

									children: ($$renderer) => {
										$$renderer.push(`<!---->UK`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ControlButton($$renderer, {
									onclick: () => map.fitBounds([[-120, 50], [-70, 20]]),
									children: ($$renderer) => {
										$$renderer.push(`<!---->US`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ControlButton($$renderer, {
									onclick: () => map.fitBounds([[110, 20], [140, 0]]),
									children: ($$renderer) => {
										$$renderer.push(`<!---->PH`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ControlGroup($$renderer, {
							children: ($$renderer) => {
								ControlButton($$renderer, {
									onclick: () => alert('!'),
									children: ($$renderer) => {
										$$renderer.push(`<!---->!`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			MapLibre($$renderer, {
				style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
				class: mapClasses,
				center: [-120, 50],
				zoom: 2,
				attributionControl: false,
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}