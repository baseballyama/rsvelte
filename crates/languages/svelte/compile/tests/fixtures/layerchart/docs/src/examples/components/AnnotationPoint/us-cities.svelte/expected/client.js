import 'svelte/internal/disclose-version';
import { getUsStatesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { AnnotationPoint, Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';

const topology = await getUsStatesTopology();
var root = $.from_html(`<!> <!>`, 1);

export default function Us_cities($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(topology, topology.objects.states);

	const annotations = [
		{
			label: 'Seattle',
			lon: -122.3321,
			lat: 47.6062,
			labelPlacement: 'top-left',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Los Angeles',
			lon: -118.2437,
			lat: 34.0522,
			labelPlacement: 'bottom-left',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Houston',
			lon: -95.3698,
			lat: 29.7604,
			labelPlacement: 'bottom',
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Chicago',
			lon: -87.6298,
			lat: 41.8781,
			labelPlacement: 'top',
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'New York',
			lon: -74.006,
			lat: 40.7128,
			labelPlacement: 'bottom-right',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Miami',
			lon: -80.1918,
			lat: 25.7617,
			labelPlacement: 'top-right',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		}
	];

	const data = { topology, states };
	var $$exports = { data };

	{
		let $0 = $.derived(() => ({ projection: geoAlbersUsa, fitGeojson: states }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			height: 500,
			padding: { right: 40 },
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						GeoPath(node, {
							get geojson() {
								return states;
							},
							class: 'fill-surface-content/10 stroke-surface-100'
						});

						var node_1 = $.sibling(node, 2);

						$.each(node_1, 17, () => annotations, (annotation) => annotation.label, ($$anchor, annotation) => {
							AnnotationPoint($$anchor, $.spread_props(() => $.get(annotation), {
								get x() {
									return $.get(annotation).lon;
								},

								get y() {
									return $.get(annotation).lat;
								},
								r: 4,
								link: true
							}));
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}