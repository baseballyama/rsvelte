import 'svelte/internal/disclose-version';

import {
	getCountriesTopology,
	getSubmarineCables,
	getSubmarineCablesLandingPoints
} from '$lib/geo.remote.js';

import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { cls } from '@layerstack/tailwind';
import { TimerState } from '@layerstack/svelte-state';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoPath, GeoPoint, GeoVisible, Graticule } from 'layerchart/geo';
import GeoPathSubmarineControls from '$lib/components/controls/GeoPathSubmarineControls.svelte';

const topology = await getCountriesTopology();
const cables = await getSubmarineCables();
const landingPoints = await getSubmarineCablesLandingPoints();
var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Submarine_cables_globe($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);
	let context = $.state(void 0);
	let velocity = $.state(3);

	const timer = new TimerState({
		delay: 1,
		tick: () => {
			if (!$.get(context)) return;

			const value = $.get(context).transform.translate;

			$.get(context).transform.translate = { x: value.x += $.get(velocity), y: value.y };
		},
		disabled: true
	});

	const data = { countries, cables, landingPoints };
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	GeoPathSubmarineControls(node, {
		get timer() {
			return timer;
		},

		get velocity() {
			return $.get(velocity);
		},

		set velocity($$value) {
			$.set(velocity, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Layer(node_2, {
				get disableHitCanvas() {
					return timer.running;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					GeoPath(node_3, {
						geojson: { type: 'Sphere' },
						class: 'fill-surface-200 stroke-surface-content/20'
					});

					var node_4 = $.sibling(node_3, 2);

					Graticule(node_4, { class: 'stroke-surface-content/20' });

					var node_5 = $.sibling(node_4, 2);

					GeoPath(node_5, {
						get geojson() {
							return countries;
						},
						class: 'stroke-surface-100/30 fill-surface-content'
					});

					var node_6 = $.sibling(node_5, 2);

					$.each(node_6, 17, () => cables.features, $.index, ($$anchor, feature, $$index, $$array) => {
						const hasColor = $.derived(() => context().tooltip.data == null || context().tooltip.data.id === $.get(feature).properties.id);

						{
							let $0 = $.derived(() => $.get(hasColor) ? $.get(feature).properties.color : undefined);
							let $1 = $.derived(() => cls('stroke-2 fill-none transition-colors', !$.get(hasColor) && 'stroke-surface-content/10'));

							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},

								get stroke() {
									return $.get($0);
								},

								get class() {
									return $.get($1);
								},
								onpointermove: (e) => context().tooltip.show(e, $.get(feature).properties),
								onpointerleave: (e) => context().tooltip.hide()
							});
						}
					});

					var node_7 = $.sibling(node_6, 2);

					$.each(node_7, 17, () => landingPoints.features, $.index, ($$anchor, feature, $$index_1, $$array_1) => {
						const computed_const = $.derived(() => {
							const [long, lat] = $.get(feature).geometry.coordinates;

							return { long, lat };
						});

						GeoVisible($$anchor, {
							get lat() {
								return $.get(computed_const).lat;
							},

							get long() {
								return $.get(computed_const).long;
							},

							children: ($$anchor, $$slotProps) => {
								GeoPoint($$anchor, {
									get lat() {
										return $.get(computed_const).lat;
									},

									get long() {
										return $.get(computed_const).long;
									},
									r: 2,
									class: 'fill-surface-content stroke-surface-100 stroke',
									onpointermove: (e) => context().tooltip.show(e, $.get(feature).properties),
									onpointerleave: (e) => context().tooltip.hide()
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, data().name));
					$.append($$anchor, text);
				};

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: countries }));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},
			transform: { mode: 'projection' },
			get ondragstart() {
				return timer.stop;
			},
			padding: { top: 5, bottom: 5, left: 5, right: 5 },
			height: 600,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}