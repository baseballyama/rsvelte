import 'svelte/internal/disclose-version';
import { getUsStatesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';
import { geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoClipPath, GeoPath, GeoTile } from 'layerchart/geo';
import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';

const topology = await getUsStatesTopology();
var root = $.from_html(`<!> <!>`, 1);

export default function Clipped($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(topology, topology.objects.states);

	const filteredStates = {
		...states,
		features: states.features.filter((d) => Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii')
	};

	let selectedFeature = $.state($.proxy(filteredStates));

	// Simple tile service URL function for OpenStreetMap
	let serviceUrl = $.state((x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`);

	let zoomDelta = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	GeoTileControls(node, {
		get serviceUrl() {
			return $.get(serviceUrl);
		},

		set serviceUrl($$value) {
			$.set(serviceUrl, $$value, true);
		},

		get doubleScale() {
			return $.get(zoomDelta);
		},

		set doubleScale($$value) {
			$.set(zoomDelta, $$value, true);
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

					GeoClipPath(node_3, {
						get geojson() {
							return $.get(selectedFeature);
						},

						children: ($$anchor, $$slotProps) => {
							GeoTile($$anchor, {
								get url() {
									return $.get(serviceUrl);
								},

								get zoomDelta() {
									return $.get(zoomDelta);
								}
							});
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					$.each(node_4, 17, () => filteredStates.features, $.index, ($$anchor, feature, $$index, $$array) => {
						GeoPath($$anchor, {
							get geojson() {
								return $.get(feature);
							},
							tooltip: true,
							class: 'stroke-black/20 hover:fill-white/30',
							onclick: () => $.set(selectedFeature, $.get(selectedFeature) === $.get(feature) ? filteredStates : $.get(feature), true)
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					const computed_const = $.derived(() => {
						const [longitude, latitude] = context().geo.projection?.invert?.([context().tooltip.x, context().tooltip.y]) ?? [];

						return { longitude, latitude };
					});

					var fragment_5 = root();
					var node_6 = $.first_child(fragment_5);

					$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().properties.name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_8 = $.first_child(fragment_7);

								$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'longitude',
										get value() {
											return $.get(computed_const).longitude;
										},
										format: 'decimal'
									});
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'latitude',
										get value() {
											return $.get(computed_const).latitude;
										},
										format: 'decimal'
									});
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({ projection: geoMercator, fitGeojson: $.get(selectedFeature) }));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},
			height: 600,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}