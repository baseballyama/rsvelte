import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoProjection, GeoPath, Graticule } from 'layerchart/geo';
import GeoPathTranslucentControls from '$lib/components/controls/GeoPathGlobeControls2.svelte';
import { TimerState } from '@layerstack/svelte-state';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Translucent_globe($$anchor, $$props) {
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

	const data = { topology, countries };
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	GeoPathTranslucentControls(node, {
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

			const computed_const = $.derived(() => {
				const [yaw, pitch, roll] = context().geo.projection?.rotate() ?? [0, 0, 0];

				return { yaw, pitch, roll };
			});

			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Layer(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_3 = $.first_child(fragment_2);

					GeoPath(node_3, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/20' });

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => ({
							yaw: $.get(computed_const).yaw + 180,
							pitch: -$.get(computed_const).pitch,
							roll: -$.get(computed_const).roll
						}));

						GeoProjection(node_4, {
							get projection() {
								return geoOrthographic;
							},

							get fitGeojson() {
								return countries;
							},

							get rotate() {
								return $.get($0);
							},
							reflectX: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_5 = $.first_child(fragment_3);

								Graticule(node_5, { class: 'stroke-surface-content/5' });

								var node_6 = $.sibling(node_5, 2);

								$.each(node_6, 17, () => countries.features, $.index, ($$anchor, country) => {
									GeoPath($$anchor, {
										get geojson() {
											return $.get(country);
										},
										class: 'stroke-surface-content/5 fill-surface-content/10'
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					}

					var node_7 = $.sibling(node_4, 2);

					Graticule(node_7, { class: 'stroke-surface-content/20' });

					var node_8 = $.sibling(node_7, 2);

					$.each(node_8, 17, () => countries.features, $.index, ($$anchor, country) => {
						GeoPath($$anchor, {
							get geojson() {
								return $.get(country);
							},
							class: 'stroke-surface-100/30 fill-surface-content/70 cursor-pointer hover:fill-primary/70',
							tooltip: true
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, data().properties.name));
					$.append($$anchor, text);
				};

				$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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