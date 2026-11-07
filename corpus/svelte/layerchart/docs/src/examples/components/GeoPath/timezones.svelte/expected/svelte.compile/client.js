import 'svelte/internal/disclose-version';
import { getCountriesTopology, getUsStatesTopology, getTimezones } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';

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

const countriesTopojson = await getCountriesTopology();
const statesTopojson = await getUsStatesTopology();
const timezonesTopojson = await getTimezones();

export let layers = ['svg', 'canvas'];

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Timezones($$anchor, $$props) {
	$.push($$props, true);

	// @ts-expect-error
	let enableClip = $.state(false);

	let showDaylight = $.state(false);
	let projection = $.state($.proxy(geoNaturalEarth1));

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
		extent($.get(timezoneGeojson).features, (d) => d.properties.zone),
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
		countriesGeojson: $.get(countriesGeojson),
		statesGeojson: $.get(statesGeojson),
		timezoneGeojson: $.get(timezoneGeojson)
	};

	var $$exports = { data };
	var fragment = root_2();
	var node = $.first_child(fragment);

	TimezonesControls(node, {
		get projections() {
			return projections;
		},

		get enableClip() {
			return $.get(enableClip);
		},

		set enableClip($$value) {
			$.set(enableClip, $$value, true);
		},

		get showDaylight() {
			return $.get(showDaylight);
		},

		set showDaylight($$value) {
			$.set(showDaylight, $$value, true);
		},

		get projection() {
			return $.get(projection);
		},

		set projection($$value) {
			$.set(projection, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({
			projection: $.get(projection),
			fitGeojson: $.get(countriesGeojson)
		}));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},
			padding: { left: 10, right: 10 },
			height: 600,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_2 = $.first_child(fragment_1);

				Layer(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_3 = $.first_child(fragment_2);

						GeoPath(node_3, {
							geojson: { type: 'Sphere' },
							class: 'stroke-surface-content/30',
							id: 'globe'
						});

						var node_4 = $.sibling(node_3, 2);

						{
							let $0 = $.derived(() => !$.get(enableClip));

							GeoClipPath(node_4, {
								get geojson() {
									return $.get(countriesGeojson);
								},

								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_5 = $.first_child(fragment_3);

									$.each(node_5, 17, () => $.get(timezoneGeojson).features, $.index, ($$anchor, feature, $$index, $$array) => {
										{
											let $0 = $.derived(() => $.get(colorScale)($.get(feature).properties.zone));

											GeoPath($$anchor, {
												get geojson() {
													return $.get(feature);
												},
												tooltip: true,
												get fill() {
													return $.get($0);
												},
												class: 'stroke-gray-900/50 hover:brightness-110'
											});
										}
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						}

						var node_6 = $.sibling(node_4, 2);

						$.each(node_6, 17, () => $.get(countriesGeojson).features, $.index, ($$anchor, feature, $$index_1, $$array_1) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'stroke-gray-900/10 fill-gray-900/20 pointer-events-none'
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.each(node_7, 17, () => $.get(statesGeojson).features, $.index, ($$anchor, feature, $$index_2, $$array_2) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'stroke-gray-900/10 pointer-events-none'
							});
						});

						var node_8 = $.sibling(node_7, 2);

						{
							var consequent = ($$anchor) => {
								ClipPath($$anchor, {
									useId: 'globe',
									children: ($$anchor, $$slotProps) => {
										Blur($$anchor, {
											children: ($$anchor, $$slotProps) => {
												{
													let $0 = $.derived(() => antipode(sun));

													GeoCircle($$anchor, {
														get center() {
															return $.get($0);
														},
														class: 'stroke-none fill-black/50 pointer-events-none'
													});
												}
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							};

							$.if(node_8, ($$render) => {
								if ($.get(showDaylight)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_2, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;

						const computed_const = $.derived(() => {
							return data().properties;
						});

						var fragment_10 = $.comment();
						var node_10 = $.first_child(fragment_10);

						$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_1();
									var node_11 = $.first_child(fragment_11);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Name',
											get value() {
												return $.get(computed_const).tz_name1st;
											}
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Places',
											get value() {
												return $.get(computed_const).places;
											},
											classes: { value: 'max-w-[200px]' }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'Timezone',
											get value() {
												return $.get(computed_const).time_zone;
											}
										});
									});

									var node_14 = $.sibling(node_13, 2);

									{
										let $0 = $.derived(() => formatDate(dateTimer.current, $.get(computed_const).time_zone.replace('UTC', '').replace('±', '+')));

										$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
											Tooltip_Item_3($$anchor, {
												label: 'Current time',
												get value() {
													return $.get($0);
												}
											});
										});
									}

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_10);
					};

					$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}