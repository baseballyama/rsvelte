import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';

import {
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic,
	geoStereographic
} from 'd3-geo';

import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';
import { SelectField } from 'svelte-ux';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="mb-4 screenshot-hidden"><!></div> <!>`, 1);

export default function Projections($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);

	const projections = [
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Stereographic', value: geoStereographic },
		{ label: 'Orthographic', value: geoOrthographic }
	];

	let projection = $.state($.proxy(projections[0].value));
	const data = { topology, countries };
	var $$exports = { data };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	SelectField(node, {
		label: 'Projection',
		get options() {
			return projections;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return $.get(projection);
		},

		set value($$value) {
			$.set(projection, $$value, true);
		}
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({
			projection: $.get(projection),
			fitGeojson: { type: 'Sphere' }
		}));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},
			padding: { top: 10, bottom: 10, left: 10, right: 10 },
			height: 500,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				Layer(node_2, {
					type: 'canvas',
					children: ($$anchor, $$slotProps) => {
						GeoRaster($$anchor, { image: '/images/blue-marble.jpg', interpolate: 'bilinear' });
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				Layer(node_3, {
					type: 'svg',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						GeoPath(node_4, {
							geojson: { type: 'Sphere' },
							class: 'fill-none stroke-surface-content/40'
						});

						var node_5 = $.sibling(node_4, 2);

						Graticule(node_5, { class: 'stroke-surface-content/15' });

						var node_6 = $.sibling(node_5, 2);

						$.each(node_6, 17, () => countries.features, $.index, ($$anchor, feature, $$index, $$array) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'fill-none stroke-surface-content/40'
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}