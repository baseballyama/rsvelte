import * as $ from 'svelte/internal/server';
import { geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip, getSettings } from 'layerchart';
import { GeoPath, GeoTile } from 'layerchart/geo';
import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';
import { getUsStatesTopology } from '$lib/geo.remote';

const topology = await getUsStatesTopology();

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(topology, topology.objects.states);

		const filteredStates = {
			...states,
			features: states.features.filter((d) => Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii')
		};

		let selectedFeature = filteredStates;

		// Simple tile service URL function for OpenStreetMap
		let serviceUrl = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

		let zoomDelta = 0;
		let settings = getSettings();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GeoTileControls($$renderer, {
				class: 'mb-4',
				get serviceUrl() {
					return serviceUrl;
				},

				set serviceUrl($$value) {
					serviceUrl = $$value;
					$$settled = false;
				},

				get doubleScale() {
					return zoomDelta;
				},

				set doubleScale($$value) {
					zoomDelta = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoTile($$renderer, { url: serviceUrl, zoomDelta, debug: settings.debug });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(filteredStates.features);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let feature = each_array[$$index];

								GeoPath($$renderer, {
									geojson: feature,
									tooltip: true,
									class: 'stroke-black/20 hover:fill-white/30',
									onclick: () => selectedFeature = selectedFeature === feature ? filteredStates : feature
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { data }) {
							const [longitude, latitude] = context.geo.projection?.invert?.([context.tooltip.x, context.tooltip.y]) ?? [];

							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(data.properties.name)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tooltip.List) {
								$$renderer.push('<!--[-->');

								Tooltip.List($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'longitude', value: longitude, format: 'decimal' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'latitude', value: latitude, format: 'decimal' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				Chart($$renderer, {
					geo: { projection: geoMercator, fitGeojson: selectedFeature },
					clip: true,
					padding: { left: 20, right: 10 },
					height: 600,
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}