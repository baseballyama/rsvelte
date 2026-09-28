import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';

import {
	geoAlbersUsa,
	geoAlbers,
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic,
	geoStereographic,
	geoGnomonic
} from 'd3-geo';

import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import GraticuleControls from '$lib/components/controls/GraticuleControls.svelte';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		stepX: 10,
		stepY: 10,
		projection: geoOrthographic,
		rotate: { yaw: 0, pitch: -30, roll: 20 },
		scale: 0
	}));

	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Orthographic', value: geoOrthographic },
		{ label: 'Stereographic', value: geoStereographic },
		{ label: 'Gnomonic', value: geoGnomonic }
	];

	const geojson = $.derived(() => feature(topology, topology.objects.countries));
	var fragment = root();
	var node = $.first_child(fragment);

	GraticuleControls(node, {
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
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Layer(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					GeoPath(node_3, { geojson: { type: 'Sphere' }, class: 'stroke-surface-content' });

					var node_4 = $.sibling(node_3, 2);

					Graticule(node_4, {
						get stepX() {
							return $.get(config).stepX;
						},

						get stepY() {
							return $.get(config).stepY;
						},
						class: 'stroke-surface-content/20 pointer-events-none'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_2, 2);

			$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
				Tooltip_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, context().tooltip.data?.properties.name));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({
			projection: $.get(config).projection,
			fitGeojson: $.get(geojson),
			rotate: $.get(config).rotate
		}));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},
			padding: { top: 10, bottom: 10 },
			height: 600,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}