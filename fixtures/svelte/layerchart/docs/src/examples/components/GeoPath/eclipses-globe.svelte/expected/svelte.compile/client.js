import 'svelte/internal/disclose-version';
import { getCountriesTopology, getEclipses } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { extent } from 'd3-array';
import { scaleDiverging } from 'd3-scale';
import { interpolateGreens, interpolatePurples } from 'd3-scale-chromatic';
import { feature } from 'topojson-client';
import { Chart, Legend, Layer, Tooltip } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import GeoPathEclipsesControls from '$lib/components/controls/GeoPathGlobeControls2.svelte';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { TimerState } from '@layerstack/svelte-state';

const topology = await getCountriesTopology();
const eclipsesData = await getEclipses();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Eclipses_globe($$anchor, $$props) {
	$.push($$props, true);

	// 'https://www.visionscarto.net/empreintes-d-eclipses',
	// 'http://xjubier.free.fr/en/site_pages/Solar_Eclipses.html',
	// 'https://stanke.co/creating-orthographic-maps-in-tableau/',
	// 'https://www.washingtonpost.com/graphics/national/eclipse/'
	const countries = feature(topology, topology.objects.countries);

	const eclipses = feature(eclipsesData, eclipsesData.objects.eclipses);
	let context = $.state(null);
	let velocity = $.state(3);

	const timer = new TimerState({
		delay: 1,
		tick: () => {
			const value = $.get(context).transform.translate;

			$.get(context).transform.translate = { x: value.x += $.get(velocity), y: value.y };
		},
		disabled: true
	});

	const dateExtents = $.derived(() => extent(eclipses.features.map((f) => f.properties.Date)));

	const colorScale = $.derived(() => scaleDiverging(
		[
			$.get(dateExtents)[0] ?? 0,
			new Date(),
			$.get(dateExtents)[1] ?? 0
		],
		(t) => t < 0.5 ? interpolatePurples(1 - t) : interpolateGreens(t)
	));

	const data = { countries, eclipses };
	var $$exports = { data };
	var fragment = root_2();
	var node = $.first_child(fragment);

	GeoPathEclipsesControls(node, {
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

			Legend(node_2, {
				get scale() {
					return $.get(colorScale);
				},
				title: 'Eclipse date',
				tickFormat: 'year'
			});

			var node_3 = $.sibling(node_2, 2);

			Layer(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					GeoPath(node_4, {
						geojson: { type: 'Sphere' },
						class: 'fill-surface-200 stroke-surface-content/20'
					});

					var node_5 = $.sibling(node_4, 2);

					Graticule(node_5, { class: 'stroke-surface-content/20' });

					var node_6 = $.sibling(node_5, 2);

					GeoPath(node_6, {
						get geojson() {
							return countries;
						},
						class: 'stroke-surface-100/30 fill-surface-content'
					});

					var node_7 = $.sibling(node_6, 2);

					$.each(node_7, 17, () => eclipses.features, $.index, ($$anchor, feature, $$index, $$array) => {
						const hasColor = $.derived(() => context().tooltip.data == null || context().tooltip.data.ID === $.get(feature).properties.ID);

						{
							let $0 = $.derived(() => $.get(hasColor)
								? $.get(colorScale)($.get(feature).properties.Date)
								: undefined);

							let $1 = $.derived(() => cls('transition-colors', !$.get(hasColor) && 'fill-surface-content/10'));

							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},

								get fill() {
									return $.get($0);
								},
								stroke: 'none',
								get class() {
									return $.get($1);
								},
								onpointermove: (e) => context().tooltip.show(e, $.get(feature).properties),
								onpointerleave: (e) => context().tooltip.hide()
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_3, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => format(data().Date, 'day', { variant: 'long' })]);
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
			padding: { top: 60 },
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