import * as $ from 'svelte/internal/server';

import {
	geoAlbersUsa,
	geoAlbers,
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic,
	geoIdentity
} from 'd3-geo';

import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { color } from 'd3-color';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoPath, GeoTile } from 'layerchart/geo';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

import {
	EmptyMessage,
	RangeField,
	SelectField,
	TextField,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import TilesetField from '$lib/components/controls/GeoTileControls.svelte';
import { Json } from '@layerstack/docs/components';

export default function Geojson_preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let geojsonStr = '';
		let geojson = void 0;
		let error = '';
		let selectedTab = 'input';
		let projection = geoMercator;

		const projections = [
			{ label: 'Identity', value: geoIdentity },
			{ label: 'Albers', value: geoAlbers },
			{ label: 'Albers USA', value: geoAlbersUsa },
			{ label: 'Equal Earth', value: geoEqualEarth },
			{ label: 'Equirectangular', value: geoEquirectangular },
			{ label: 'Mercator', value: geoMercator },
			{ label: 'Natural Earth', value: geoNaturalEarth1 },
			{ label: 'Orthographic', value: geoOrthographic }
		];

		let serviceUrl = void 0;
		let zoomDelta = 0;

		const colorScale = scaleOrdinal().range(schemeCategory10.map((hex) => {
			let c = color(hex);

			c.opacity = 0.5;

			return c.toString() ?? '';
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2"><div class="grid grid-cols-3 gap-2">`);

			SelectField($$renderer, {
				label: 'Projections',
				options: projections,
				clearable: false,
				get value() {
					return projection;
				},

				set value($$value) {
					projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TilesetField($$renderer, {
				get serviceUrl() {
					return serviceUrl;
				},

				set serviceUrl($$value) {
					serviceUrl = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Zoom delta',
				min: -5,
				max: 5,
				get value() {
					return zoomDelta;
				},

				set value($$value) {
					zoomDelta = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="h-[600px] bg-surface-100/50 border rounded-lg overflow-hidden">`);

			if (geojson) {
				$$renderer.push('<!--[0-->');

				Chart($$renderer, {
					geo: { projection, fitGeojson: geojson },
					transform: { mode: 'projection', scrollMode: 'scale' },
					padding: { top: 8, bottom: 8, left: 8, right: 8 },
					height: 600,
					children: ($$renderer) => {
						if (projection === geoMercator && serviceUrl) {
							$$renderer.push('<!--[0-->');

							Layer($$renderer, {
								children: ($$renderer) => {
									GeoTile($$renderer, { url: serviceUrl, zoomDelta: -100 });
									$$renderer.push(`<!----> `);
									GeoTile($$renderer, { url: serviceUrl, zoomDelta: -4 });
									$$renderer.push(`<!----> `);
									GeoTile($$renderer, { url: serviceUrl, zoomDelta: -1 });
									$$renderer.push(`<!----> `);
									GeoTile($$renderer, { url: serviceUrl, zoomDelta });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						TransformControls($$renderer, {});
						$$renderer.push(`<!----> `);

						Layer($$renderer, {
							children: ($$renderer) => {
								if (geojson?.features) {
									$$renderer.push(`<!--[0--><!--[-->`);

									const each_array = $.ensure_array_like(geojson?.features);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let feature = each_array[$$index];

										GeoPath($$renderer, {
											geojson: feature,
											fill: colorScale(String(feature.id)),
											class: 'stroke-black',
											tooltip: true
										});
									}

									$$renderer.push(`<!--]-->`);
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
								if (Tooltip.List) {
									$$renderer.push('<!--[-->');

									Tooltip.List($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like(Object.entries(data.properties));

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let [key, value] = each_array_1[$$index_1];

												if (Tooltip.Item) {
													$$renderer.push('<!--[-->');
													Tooltip.Item($$renderer, { label: key, value });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(`<!--]-->`);
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
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');

				EmptyMessage($$renderer, {
					class: 'h-full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Please enter input below`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div> `);

			ToggleGroup($$renderer, {
				variant: 'underline',
				classes: { options: 'justify-start h-10' },
				get value() {
					return selectedTab;
				},

				set value($$value) {
					selectedTab = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					ToggleOption($$renderer, {
						value: 'input',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Input`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleOption($$renderer, {
						value: 'geojson',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Parsed`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (selectedTab === 'input') {
				$$renderer.push('<!--[0-->');

				TextField($$renderer, {
					label: 'GeoJSON',
					placeholder: '{"type": "FeatureCollection", "features": [...] }',
					multiline: true,
					classes: { input: 'h-[400px]' },
					get value() {
						return geojsonStr;
					},

					set value($$value) {
						geojsonStr = $$value;
						$$settled = false;
					}
				});
			} else if (selectedTab === 'geojson') {
				$$renderer.push('<!--[1-->');
				Json($$renderer, { value: geojson });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}