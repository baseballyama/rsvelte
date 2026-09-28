import 'svelte/internal/disclose-version';
import { getTectonicPlates, getEarthquakes, getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { scaleSqrt } from 'd3-scale';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoCircle, GeoPath, Graticule } from 'layerchart/geo';
import { feature } from 'topojson-client';
import EarthquakeControls from '$lib/components/controls/GeoCircleEarthquakeControls.svelte';
import { TimerState } from '@layerstack/svelte-state';

const topology = await getCountriesTopology();
const tectonicPlates = await getTectonicPlates();
const earthquakes = await getEarthquakes();
var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Earthquake_globe($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);
	let context = $.state(void 0);
	let velocity = $.state(3);

	const timer = new TimerState({
		delay: 1,
		tick: () => {
			if (!$.get(context)) return;

			const curr = $.get(context).transform.translate;

			$.get(context).transform.translate = { x: curr.x += $.get(velocity), y: curr.y };
		},
		disabled: true
	});

	const data = { countries, tectonicPlates, earthquakes };
	var $$exports = { data };
	var fragment = root_2();
	var node = $.first_child(fragment);

	EarthquakeControls(node, {
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
			var fragment_1 = root_2();
			var node_2 = $.first_child(fragment_1);

			Layer(node_2, {
				get disableHitCanvas() {
					return timer.running;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					GeoPath(node_3, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });

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

					GeoPath(node_6, {
						get geojson() {
							return tectonicPlates;
						},
						class: 'stroke-danger-100/30'
					});

					var node_7 = $.sibling(node_6, 2);

					$.each(node_7, 17, () => earthquakes, $.index, ($$anchor, eq) => {
						{
							let $0 = $.derived(() => [$.get(eq).longitude, $.get(eq).latitude]);
							let $1 = $.derived(() => context().rScale(Math.exp($.get(eq).magnitude)));

							GeoCircle($$anchor, {
								get center() {
									return $.get($0);
								},

								get radius() {
									return $.get($1);
								},
								class: 'stroke-danger fill-danger/20',
								onpointermove: (e) => context().tooltip.show(e, $.get(eq)),
								onpointerleave: () => context().tooltip.hide()
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_2();
					var node_9 = $.first_child(fragment_4);

					$.component(node_9, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().place));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_11 = $.first_child(fragment_6);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Latitude',
										get value() {
											return data().latitude;
										},
										format: 'decimal'
									});
								});

								var node_12 = $.sibling(node_11, 2);

								$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Longitude',
										get value() {
											return data().longitude;
										},
										format: 'decimal'
									});
								});

								var node_13 = $.sibling(node_12, 2);

								$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Magnitude',
										get value() {
											return data().magnitude;
										},
										format: 'decimal'
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(scaleSqrt);
		let $1 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: countries }));

		Chart(node_1, {
			get data() {
				return earthquakes;
			},
			x: 'longitude',
			y: 'latitude',
			r: 'magnitude',
			get rScale() {
				return $.get($0);
			},
			rDomain: [0, 100],
			rRange: [0, 1],
			get geo() {
				return $.get($1);
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