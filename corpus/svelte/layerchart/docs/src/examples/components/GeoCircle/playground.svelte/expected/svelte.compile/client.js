import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, defaultChartPadding } from 'layerchart';
import { GeoCircle, GeoPath, Graticule } from 'layerchart/geo';

import {
	geoAlbersUsa,
	geoAlbers,
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic
} from 'd3-geo';

import { range } from 'd3-array';
import { feature } from 'topojson-client';
import GeoCircleControls from '$lib/components/controls/GeoCirclePlaygroundControls.svelte';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		example: 'single',
		latitude: 0,
		longitude: 0,
		radius: 600,
		precision: 6,
		projection: geoNaturalEarth1
	}));

	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Orthographic', value: geoOrthographic }
	];

	const geojson = $.derived(() => feature(topology, topology.objects.countries));

	const features = $.derived(() => $.get(config).projection === geoAlbersUsa
		? $.get(geojson).features.filter((f) => f.properties.name === 'United States of America')
		: $.get(geojson).features);

	const step = 10;

	const coordinates = range(-80, 80 + step, step).flatMap((y) => {
		return range(-180, 180 + step, step).map((x) => {
			return [x, y];
		});
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	GeoCircleControls(node, {
		get projections() {
			return projections;
		},

		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({
			projection: $.get(config).projection,
			fitGeojson: $.get(geojson)
		}));

		let $1 = $.derived(() => defaultChartPadding({ left: 10, right: 10 }));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 600,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						GeoPath(node_2, {
							geojson: { type: 'Sphere' },
							class: 'stroke-surface-content/30',
							id: 'globe'
						});

						var node_3 = $.sibling(node_2, 2);

						Graticule(node_3, { class: 'stroke-surface-content/20' });

						var node_4 = $.sibling(node_3, 2);

						$.each(node_4, 17, () => $.get(features), $.index, ($$anchor, feature, $$index, $$array) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'stroke-surface-content/30 fill-surface-content/20 pointer-events-none'
							});
						});

						var node_5 = $.sibling(node_4, 2);

						{
							var consequent = ($$anchor) => {
								{
									let $0 = $.derived(() => [$.get(config).longitude, $.get(config).latitude]);
									let $1 = $.derived(() => $.get(config).radius / (6371 * Math.PI * 2) * 360);

									GeoCircle($$anchor, {
										get center() {
											return $.get($0);
										},

										get radius() {
											return $.get($1);
										},

										get precision() {
											return $.get(config).precision;
										},
										class: 'fill-danger stroke-none'
									});
								}
							};

							var consequent_1 = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_6 = $.first_child(fragment_5);

								$.each(node_6, 17, () => coordinates, $.index, ($$anchor, coords) => {
									{
										let $0 = $.derived(() => [$.get(coords)[0], $.get(coords)[1]]);

										GeoCircle($$anchor, {
											get center() {
												return $.get($0);
											},
											radius: step / 4,
											get precision() {
												return $.get(config).precision;
											},
											class: 'stroke-danger'
										});
									}
								});

								$.append($$anchor, fragment_5);
							};

							$.if(node_5, ($$render) => {
								if ($.get(config).example === 'single') $$render(consequent); else if ($.get(config).example === 'multi') $$render(consequent_1, 1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}