import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip, geoFitObjectTransform, getSettings } from 'layerchart';
import { GeoPath, GeoTile } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';
import { getUsCountiesTopology } from '$lib/geo.remote.js';

const geojson = await getUsCountiesTopology();

export default function Zoomable_seamless_layers($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let settings = getSettings();
		const states = $.derived(() => feature(geojson, geojson.objects.states));

		const filteredStates = $.derived(() => ({
			...states(),
			features: states().features.filter((d) => {
				// Contiguous states
				return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
			})
		}));

		let serviceUrl = null;
		let zoomDelta = 0;
		const data = { geojson, states: states(), filteredStates: filteredStates() };
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

			if (serviceUrl) {
				$$renderer.push('<!--[0-->');

				{
					function children($$renderer, { context }) {
						if (settings.debug) {
							$$renderer.push(`<!--[0--><div class="absolute top-0 left-0 z-10 grid gap-1"></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						TransformContextControls($$renderer, {});
						$$renderer.push(`<!----> `);

						Layer($$renderer, {
							children: ($$renderer) => {
								GeoTile($$renderer, { url: serviceUrl, zoomDelta: -100 });
								$$renderer.push(`<!----> `);
								GeoTile($$renderer, { url: serviceUrl, zoomDelta: -4 });
								$$renderer.push(`<!----> `);
								GeoTile($$renderer, { url: serviceUrl, zoomDelta: -1 });
								$$renderer.push(`<!----> `);
								GeoTile($$renderer, { url: serviceUrl, zoomDelta, debug: settings.debug });
								$$renderer.push(`<!----> <!--[-->`);

								const each_array = $.ensure_array_like(filteredStates().features);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let feature = each_array[$$index];

									GeoPath($$renderer, {
										geojson: feature,
										class: 'stroke-none',
										tooltip: true,
										onclick: () => {
											if (!context.geo.projection) return;

											const featureTransform = geoFitObjectTransform(context.geo.projection, [context.width, context.height], feature);

											context.transform.setTranslate(featureTransform.translate);
											context.transform.setScale(featureTransform.scale);
										}
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
						geo: { projection: geoMercator, fitGeojson: filteredStates() },
						transform: {
							mode: 'projection',
							scrollMode: 'scale',
							motion: { type: 'tween', duration: 800, easing: cubicOut },
							inertia: { decay: 0.99, _maxVelocity: 1.4 }
						},
						clip: true,
						height: 600,
						children,
						$$slots: { default: true }
					});
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}