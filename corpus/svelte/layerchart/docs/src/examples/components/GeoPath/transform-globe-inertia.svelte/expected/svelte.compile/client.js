import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { RangeField, Switch, Field } from 'svelte-ux';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-3 items-end mb-2 screenshot-hidden"><!> <!> <!></div> <!>`, 1);

export default function Transform_globe_inertia($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);
	let decay = $.state(0.99);
	let minVelocity = $.state(0.1);
	let enabled = $.state(true);
	const data = { topology, countries };
	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Field(node, {
		label: 'Enabled',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return $.get(enabled);
					},

					set checked($$value) {
						$.set(enabled, $$value, true);
					}
				});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Decay',
		min: 0.9,
		max: 0.999,
		step: 0.001,
		get value() {
			return $.get(decay);
		},

		set value($$value) {
			$.set(decay, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Min velocity',
		min: 0.01,
		max: 0.5,
		step: 0.01,
		get value() {
			return $.get(minVelocity);
		},

		set value($$value) {
			$.set(minVelocity, $$value, true);
		}
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: countries }));

		let $1 = $.derived(() => ({
			mode: 'projection',
			motion: 'spring',
			inertia: $.get(enabled)
				? { decay: $.get(decay), minVelocity: $.get(minVelocity) }
				: false,

			constrain: ({ scale, translate }) => ({
				scale,
				translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
			})
		}));

		Chart(node_3, {
			get geo() {
				return $.get($0);
			},

			get transform() {
				return $.get($1);
			},
			padding: { top: 5, bottom: 5, left: 5, right: 5 },
			height: 400,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						GeoPath(node_4, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/20' });

						var node_5 = $.sibling(node_4, 2);

						Graticule(node_5, { class: 'stroke-surface-content/20' });

						var node_6 = $.sibling(node_5, 2);

						$.each(node_6, 17, () => countries.features, $.index, ($$anchor, feature, $$index, $$array) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'stroke-surface-100/30 fill-surface-content/70'
							});
						});

						$.append($$anchor, fragment_3);
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