import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';
import { geoNaturalEarth1 } from 'd3-geo';
import { feature } from 'topojson-client';
import { AnnotationPoint, Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!>`, 1);

export default function World_landmarks($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);

	const annotations = [
		{
			label: 'Statue of Liberty',
			lon: -74.0445,
			lat: 40.6892,
			labelPlacement: 'left',
			labelXOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Machu Picchu',
			lon: -72.545,
			lat: -13.1631,
			labelPlacement: 'bottom-left',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Eiffel Tower',
			lon: 2.2945,
			lat: 48.8584,
			labelPlacement: 'top-right',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Pyramids of Giza',
			lon: 31.1342,
			lat: 29.9792,
			labelPlacement: 'bottom-left',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Mt. Everest',
			lon: 86.925,
			lat: 27.9881,
			labelPlacement: 'top',
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Great Wall',
			lon: 117.2381,
			lat: 40.3587,
			labelPlacement: 'top-right',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},

		{
			label: 'Sydney Opera House',
			lon: 151.2153,
			lat: -33.8568,
			labelPlacement: 'bottom',
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		}
	];

	const data = { topology, countries };
	var $$exports = { data };

	{
		let $0 = $.derived(() => ({ projection: geoNaturalEarth1, fitGeojson: countries }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			height: 500,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						$.each(node, 17, () => countries.features, $.index, ($$anchor, f) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(f);
								},
								class: 'fill-surface-content/10 stroke-surface-100'
							});
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