import 'svelte/internal/disclose-version';
import { getUsCountiesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip, geoFitObjectTransform, getSettings } from 'layerchart';
import { GeoPath, GeoTile } from 'layerchart/geo';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';
import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';

const geojson = await getUsCountiesTopology();
var root = $.from_html(`<div class="absolute top-0 left-0 z-10 grid gap-1"></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Zoomable_with_padding($$anchor, $$props) {
	$.push($$props, true);

	let settings = getSettings();
	const states = $.derived(() => feature(geojson, geojson.objects.states));

	const filteredStates = $.derived(() => ({
		...$.get(states),
		features: $.get(states).features.filter((d) => {
			// Contiguous states
			return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
		})
	}));

	let serviceUrl = $.state(null);
	let zoomDelta = $.state(0);

	const data = {
		geojson,
		states: $.get(states),
		filteredStates: $.get(filteredStates)
	};

	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	GeoTileControls(node, {
		class: 'mb-4',
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
		var consequent_1 = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let context = () => ($$arg0?.()).context;
					var fragment_2 = root_2();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var div = root();

							$.append($$anchor, div);
						};

						$.if(node_2, ($$render) => {
							if (settings.debug) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_2, 2);

					TransformControls(node_3, {});

					var node_4 = $.sibling(node_3, 2);

					Layer(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_5 = $.first_child(fragment_3);

							GeoTile(node_5, {
								get url() {
									return $.get(serviceUrl);
								},

								get zoomDelta() {
									return $.get(zoomDelta);
								},

								get debug() {
									return settings.debug;
								}
							});

							var node_6 = $.sibling(node_5, 2);

							$.each(node_6, 17, () => $.get(filteredStates).features, $.index, ($$anchor, feature, $$index, $$array) => {
								GeoPath($$anchor, {
									get geojson() {
										return $.get(feature);
									},
									class: 'stroke-none',
									tooltip: true,
									onclick: () => {
										if (!context().geo.projection) return;

										const featureTransform = geoFitObjectTransform(context().geo.projection, [context().width, context().height], $.get(feature));

										context().transform.setTranslate(featureTransform.translate);
										context().transform.setScale(featureTransform.scale);
									}
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_4, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let data = () => ($$arg0?.()).data;

							const computed_const = $.derived(() => {
								const [longitude, latitude] = context().geo.projection?.invert?.([
									context().tooltip.x - context().padding.left,
									context().tooltip.y - context().padding.top
								]) ?? [];

								return { longitude, latitude };
							});

							var fragment_5 = root_1();
							var node_8 = $.first_child(fragment_5);

							$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_1();
										var node_10 = $.first_child(fragment_7);

										$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												label: 'longitude',
												get value() {
													return $.get(computed_const).longitude;
												},
												format: 'decimal'
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
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

						$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
							Tooltip_Root($$anchor, { children, $$slots: { default: true } });
						});
					}

					$.append($$anchor, fragment_2);
				};

				let $0 = $.derived(() => ({ projection: geoMercator, fitGeojson: $.get(filteredStates) }));

				Chart($$anchor, {
					get geo() {
						return $.get($0);
					},
					transform: { mode: 'projection', scrollMode: 'scale' },
					padding: { top: 100, bottom: 100, left: 100, right: 100 },
					clip: true,
					height: 600,
					children,
					$$slots: { default: true }
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(serviceUrl)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}