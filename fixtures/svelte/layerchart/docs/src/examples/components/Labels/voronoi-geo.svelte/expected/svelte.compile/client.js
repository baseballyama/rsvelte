import 'svelte/internal/disclose-version';
import { getCountriesTopology, getWorldAirports } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';

import {
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1
} from 'd3-geo';

import { feature } from 'topojson-client';
import { Field, RangeField, SelectField, Switch } from 'svelte-ux';
import { Chart, Labels, Layer, Points } from 'layerchart';
import { GeoPath } from 'layerchart/geo';

const [topology, allAirports] = await Promise.all([getCountriesTopology(), getWorldAirports()]);
const airports = allAirports.filter((_, i) => i % 20 === 0);
var root = $.from_html(`<div slot="append" class="flex items-center pl-2" role="none"><!></div>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2 w-60"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-wrap items-center gap-4 mb-2 screenshot-hidden"><!> <!> <!></div> <!>`, 1);

export default function Voronoi_geo($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);

	const projections = [
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Mercator', value: geoMercator }
	];

	const linkTypeOptions = [
		{ label: 'Straight', value: 'straight' },
		{ label: 'Swoop', value: 'swoop' },
		{ label: 'Rounded', value: 'rounded' },
		{ label: 'Square', value: 'square' },
		{ label: 'Beveled', value: 'beveled' }
	];

	let projection = $.state($.proxy(geoNaturalEarth1));
	let linkType = $.state('straight');
	let useLinks = $.state(true);
	let occludeLabels = $.state(true);
	let spacing = $.state(3);
	const data = airports;
	var $$exports = { data };
	var fragment = root_3();
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
		class: 'w-60',
		get value() {
			return $.get(projection);
		},

		set value($$value) {
			$.set(projection, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	SelectField(node_1, {
		label: 'Links',
		get options() {
			return linkTypeOptions;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		class: 'w-60',
		get value() {
			return $.get(linkType);
		},

		set value($$value) {
			$.set(linkType, $$value, true);
		},

		$$slots: {
			append: ($$anchor, $$slotProps) => {
				var div_1 = root();
				var node_2 = $.child(div_1);

				Switch(node_2, {
					size: 'md',
					get checked() {
						return $.get(useLinks);
					},

					set checked($$value) {
						$.set(useLinks, $$value, true);
					}
				});

				$.reset(div_1);
				$.delegated('click', div_1, (e) => e.stopPropagation());
				$.append($$anchor, div_1);
			}
		}
	});

	var node_3 = $.sibling(node_1, 2);

	Field(node_3, {
		label: 'Occlude',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);
				var div_2 = root_1();
				var node_4 = $.child(div_2);

				{
					let $0 = $.derived(() => !$.get(occludeLabels));

					RangeField(node_4, {
						min: 0,
						max: 12,
						get disabled() {
							return $.get($0);
						},
						class: 'flex-1',
						get value() {
							return $.get(spacing);
						},

						set value($$value) {
							$.set(spacing, $$value, true);
						}
					});
				}

				var node_5 = $.sibling(node_4, 2);

				Switch(node_5, {
					size: 'md',
					get id() {
						return $.get(id);
					},

					get checked() {
						return $.get(occludeLabels);
					},

					set checked($$value) {
						$.set(occludeLabels, $$value, true);
					}
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			}
		}
	});

	$.reset(div);

	var node_6 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({
			projection: $.get(projection),
			fitGeojson: { type: 'Sphere' }
		}));

		Chart(node_6, {
			get data() {
				return data;
			},
			x: 'longitude',
			y: 'latitude',
			get geo() {
				return $.get($0);
			},
			height: 500,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_7 = $.first_child(fragment_2);

						GeoPath(node_7, {
							geojson: { type: 'Sphere' },
							class: 'fill-surface-100 stroke-surface-content/20'
						});

						var node_8 = $.sibling(node_7, 2);

						$.each(node_8, 17, () => countries.features, $.index, ($$anchor, country) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(country);
								},
								class: 'fill-surface-content/10 stroke-surface-100'
							});
						});

						var node_9 = $.sibling(node_8, 2);

						Points(node_9, { r: 1.5, class: 'fill-surface-content' });

						var node_10 = $.sibling(node_9, 2);

						{
							let $0 = $.derived(() => $.get(useLinks)
								? { type: $.get(linkType), class: 'stroke-surface-content/40' }
								: false);

							let $1 = $.derived(() => $.get(occludeLabels) ? { padding: $.get(spacing) } : false);

							Labels(node_10, {
								value: (d) => d.name.split(' ')[0],
								layout: 'voronoi',
								get links() {
									return $.get($0);
								},

								get occlude() {
									return $.get($1);
								},
								fontSize: 9,
								class: 'fill-surface-content stroke-surface-100 stroke-[3px] [paint-order:stroke] pointer-events-none'
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

	return $.pop($$exports);
}

$.delegate(['click']);