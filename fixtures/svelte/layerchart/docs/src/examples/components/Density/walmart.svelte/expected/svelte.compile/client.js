import 'svelte/internal/disclose-version';
import { getWalmarts, getUsStatesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { scaleSequential } from 'd3-scale';
import { interpolateYlGnBu } from 'd3-scale-chromatic';
import { geoAlbersUsa } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { Chart, Circle, Density, Layer, Tooltip } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

const walmarts = await getWalmarts();
const geojson = await getUsStatesTopology();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Walmart($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(geojson, geojson.objects.states);
	const nation = feature(geojson, geojson.objects.nation);
	const statemesh = mesh(geojson, geojson.objects.states, (a, b) => a !== b);
	var $$exports = { data: walmarts };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			TransformControls(node, {});

			var node_1 = $.sibling(node, 2);

			Layer(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Density(node_2, {
						get data() {
							return walmarts;
						},
						x: 'longitude',
						y: 'latitude',
						bandwidth: 10,
						fillOpacity: 0.7
					});

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => 0.5 / context().transform.scale);

						GeoPath(node_3, {
							get geojson() {
								return statemesh;
							},
							class: 'fill-none stroke-surface-content/30',
							get strokeWidth() {
								return $.get($0);
							}
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => 1 / context().transform.scale);

						GeoPath(node_4, {
							get geojson() {
								return nation;
							},
							class: 'fill-none stroke-surface-content',
							get strokeWidth() {
								return $.get($0);
							}
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => 1 / context().transform.scale);

						Circle(node_5, {
							cx: 'longitude',
							cy: 'latitude',
							get r() {
								return $.get($0);
							},
							fill: 'currentColor'
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			Layer(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_7 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => [context().tooltip.data]);
								let $1 = $.derived(() => 4 / context().transform.scale);
								let $2 = $.derived(() => 1 / context().transform.scale);

								Circle($$anchor, {
									get data() {
										return $.get($0);
									},
									cx: 'longitude',
									cy: 'latitude',
									get r() {
										return $.get($1);
									},

									get strokeWidth() {
										return $.get($2);
									},
									class: 'stroke-surface-content/30 fill-surface-content/10 pointer-events-none',
									motion: 'spring'
								});
							}
						};

						$.if(node_7, ($$render) => {
							if (context().tooltip.data) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = root_1();
					var node_9 = $.first_child(fragment_5);

					$.component(node_9, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, `${data().city ?? ''}, ${data().state ?? ''}`));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root_1();
								var node_11 = $.first_child(fragment_7);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Type',
										get value() {
											return data().type;
										}
									});
								});

								var node_12 = $.sibling(node_11, 2);

								$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Opened',
										get value() {
											return data().date;
										},
										format: 'day'
									});
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => scaleSequential(interpolateYlGnBu));
		let $1 = $.derived(() => ({ projection: geoAlbersUsa, fitGeojson: states }));

		Chart($$anchor, {
			get data() {
				return walmarts;
			},
			x: 'longitude',
			y: 'latitude',
			get cScale() {
				return $.get($0);
			},

			get geo() {
				return $.get($1);
			},
			transform: { mode: 'canvas', scrollMode: 'scale', motion: 'spring' },
			tooltipContext: { mode: 'quadtree' },
			clip: true,
			height: 500,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}