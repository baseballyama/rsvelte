import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';
import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip, geoFitObjectTransform, getSettings } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import GeoPathProjectionControls from '$lib/components/controls/GeoPathProjectionControls.svelte';
import { getUsCountiesTopology } from '$lib/geo.remote.js';

const geojson = await getUsCountiesTopology();

export default function Transform_projection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let settings = getSettings();
		let projection = geoAlbersUsa;

		const projections = [
			{ label: 'Albers', value: geoAlbers },
			{ label: 'Albers USA', value: geoAlbersUsa },
			{ label: 'Mercator', value: geoMercator }
		];

		const counties = feature(geojson, geojson.objects.counties);
		const states = feature(geojson, geojson.objects.states);

		const contiguousStates = $.derived(() => ({
			...states,
			features: states.features.filter((d) => {
				// Contiguous states
				return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
			})
		}));

		let selectedStateId = null;

		const selectedCountiesFeatures = $.derived(() => selectedStateId
			? counties.features.filter((f) => f.id.slice(0, 2) === selectedStateId)
			: []);

		const data = {
			geojson,
			counties,
			states,
			contiguousStates: contiguousStates()
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GeoPathProjectionControls($$renderer, {
				projections,
				get projection() {
					return projection;
				},

				set projection($$value) {
					projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					TransformContextControls($$renderer, {});
					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(states.features);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let feature = each_array[$$index];

								GeoPath($$renderer, {
									geojson: feature,
									class: 'stroke-surface-content fill-surface-100 hover:fill-surface-content/10',
									tooltip: true,
									onclick: () => {
										context.tooltip.hide();

										if (selectedStateId === feature.id) {
											selectedStateId = null;
											context.transform.reset();
										} else {
											selectedStateId = feature.id;

											if (context.geo.projection) {
												const featureTransform = geoFitObjectTransform(context.geo.projection, [context.width, context.height], feature);

												context.transform.setTranslate(featureTransform.translate);
												context.transform.setScale(featureTransform.scale);
											}
										}
									}
								});
							}

							$$renderer.push(`<!--]--><!--[-->`);

							const each_array_1 = $.ensure_array_like(selectedCountiesFeatures());

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let feature = each_array_1[$$index_1];

								$$renderer.push(`<g>`);

								GeoPath($$renderer, {
									geojson: feature,
									tooltip: true,
									class: 'stroke-surface-content/10 hover:stroke-surface-content/50 hover:fill-surface-content/10',
									onclick: () => {
										selectedStateId = null;
										context.tooltip.hide();
										context.transform.reset();
									}
								});

								$$renderer.push(`<!----></g>`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						pointerEvents: false,
						children: ($$renderer) => {
							if (context.tooltip.data && settings.layer === 'canvas') {
								$$renderer.push('<!--[0-->');

								GeoPath($$renderer, {
									geojson: context.tooltip.data,
									strokeWidth: 1 / context.transform.scale,
									class: 'stroke-surface-content/50 fill-surface-content/20'
								});
							} else {
								$$renderer.push('<!--[-1-->');
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
					geo: {
						projection,
						fitGeojson: projection === geoMercator ? contiguousStates() : states
					},
					transform: {
						mode: 'projection',
						scrollMode: 'none',
						motion: { type: 'tween', duration: 800, easing: cubicOut },
						inertia: true
					},
					clip: true,
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
		$.bind_props($$props, { data });
	});
}