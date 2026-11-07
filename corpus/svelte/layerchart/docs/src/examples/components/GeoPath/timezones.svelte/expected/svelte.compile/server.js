import * as $ from 'svelte/internal/server';

import {
	geoAlbersUsa,
	geoAlbers,
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic
} from 'd3-geo';

import { extent } from 'd3-array';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import { feature } from 'topojson-client';
import { century, equationOfTime, declination } from 'solar-calculator';
import { Blur, Chart, ClipPath, Layer, Tooltip, antipode } from 'layerchart';
import { GeoCircle, GeoClipPath, GeoPath } from 'layerchart/geo';
import TimezonesControls from '$lib/components/controls/GeoPathTimezonesControls.svelte';
import { TimerState } from '@layerstack/svelte-state';
import { getCountriesTopology, getUsStatesTopology, getTimezones } from '$lib/geo.remote.js';

const countriesTopojson = await getCountriesTopology();
const statesTopojson = await getUsStatesTopology();
const timezonesTopojson = await getTimezones();

export let layers = ['svg', 'canvas'];

export default function Timezones($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// @ts-expect-error
		let enableClip = false;

		let showDaylight = false;
		let projection = geoNaturalEarth1;

		const projections = [
			{ label: 'Albers', value: geoAlbers },
			{ label: 'Albers USA', value: geoAlbersUsa },
			{ label: 'Equal Earth', value: geoEqualEarth },
			{ label: 'Equirectangular', value: geoEquirectangular },
			{ label: 'Mercator', value: geoMercator },
			{ label: 'Natural Earth', value: geoNaturalEarth1 }

			// { label: 'Orthographic', value: geoOrthographic },
		];

		const countriesGeojson = $.derived(() => feature(countriesTopojson, countriesTopojson.objects.countries));
		const statesGeojson = $.derived(() => feature(statesTopojson, statesTopojson.objects.states));
		const timezoneGeojson = $.derived(() => feature(timezonesTopojson, timezonesTopojson.objects.timezones));

		const colorScale = $.derived(() => scaleSequential(
			// @ts-expect-error
			extent(timezoneGeojson().features, (d) => d.properties.zone),
			interpolateRdBu
		));

		const dateTimer = new TimerState();

		function formatDate(date, timeZone) {
			let result = '-';

			if (timeZone) {
				try {
					result = new Intl.DateTimeFormat(undefined, { timeStyle: 'medium', dateStyle: 'short', timeZone }).format(date);
				} catch {}
			}

			return result;
		}

		const now = new Date();
		const day = new Date(+now).setUTCHours(0, 0, 0, 0);
		const t = century(now);
		const longitude = (day - now.valueOf()) / 864e5 * 360 - 180;
		const sun = [longitude - equationOfTime(t) / 4, declination(t)];

		const data = {
			countriesTopojson,
			statesTopojson,
			timezonesTopojson,
			countriesGeojson: countriesGeojson(),
			statesGeojson: statesGeojson(),
			timezoneGeojson: timezoneGeojson()
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TimezonesControls($$renderer, {
				projections,
				get enableClip() {
					return enableClip;
				},

				set enableClip($$value) {
					enableClip = $$value;
					$$settled = false;
				},

				get showDaylight() {
					return showDaylight;
				},

				set showDaylight($$value) {
					showDaylight = $$value;
					$$settled = false;
				},

				get projection() {
					return projection;
				},

				set projection($$value) {
					projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				geo: { projection, fitGeojson: countriesGeojson() },
				padding: { left: 10, right: 10 },
				height: 600,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'stroke-surface-content/30',
								id: 'globe'
							});

							$$renderer.push(`<!----> `);

							GeoClipPath($$renderer, {
								geojson: countriesGeojson(),
								disabled: !enableClip,
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(timezoneGeojson().features);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let feature = each_array[$$index];

										GeoPath($$renderer, {
											geojson: feature,
											tooltip: true,
											fill: colorScale()(feature.properties.zone),
											class: 'stroke-gray-900/50 hover:brightness-110'
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array_1 = $.ensure_array_like(countriesGeojson().features);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let feature = each_array_1[$$index_1];

								GeoPath($$renderer, {
									geojson: feature,
									class: 'stroke-gray-900/10 fill-gray-900/20 pointer-events-none'
								});
							}

							$$renderer.push(`<!--]--> <!--[-->`);

							const each_array_2 = $.ensure_array_like(statesGeojson().features);

							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let feature = each_array_2[$$index_2];

								GeoPath($$renderer, {
									geojson: feature,
									class: 'stroke-gray-900/10 pointer-events-none'
								});
							}

							$$renderer.push(`<!--]--> `);

							if (showDaylight) {
								$$renderer.push('<!--[0-->');

								ClipPath($$renderer, {
									useId: 'globe',
									children: ($$renderer) => {
										Blur($$renderer, {
											children: ($$renderer) => {
												GeoCircle($$renderer, {
													center: antipode(sun),
													class: 'stroke-none fill-black/50 pointer-events-none'
												});
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
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
							const { tz_name1st, time_zone, places } = data.properties;

							if (Tooltip.List) {
								$$renderer.push('<!--[-->');

								Tooltip.List($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Name', value: tz_name1st });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Places',
												value: places,
												classes: { value: 'max-w-[200px]' }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Timezone', value: time_zone });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Current time',
												value: formatDate(dateTimer.current, time_zone.replace('UTC', '').replace('±', '+'))
											});

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
				},
				$$slots: { default: true }
			});

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