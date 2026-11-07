import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	geoAlbersUsa,
	geoAlbers,
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic,
	geoIdentity
} from 'd3-geo';

import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { color } from 'd3-color';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoPath, GeoTile } from 'layerchart/geo';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

import {
	EmptyMessage,
	RangeField,
	SelectField,
	TextField,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import TilesetField from '$lib/components/controls/GeoTileControls.svelte';
import { Json } from '@layerstack/docs/components';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid gap-2"><div class="grid grid-cols-3 gap-2"><!> <!> <!></div> <div class="h-[600px] bg-surface-100/50 border rounded-lg overflow-hidden"><!></div> <!> <!></div>`);

export default function Geojson_preview($$anchor, $$props) {
	$.push($$props, true);

	let geojsonStr = $.state('');
	let geojson = $.state(void 0);
	let error = $.state('');
	let selectedTab = $.state('input');

	$.user_pre_effect(() => {
		if ($.get(geojsonStr)) {
			try {
				$.set(geojson, JSON.parse($.get(geojsonStr)), true);
				$.set(error, '');
			} catch(e) {
				$.set(error, 'Invalid object');
				console.error(e);
			}
		}
	});

	let projection = $.state($.proxy(geoMercator));

	const projections = [
		{ label: 'Identity', value: geoIdentity },
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Orthographic', value: geoOrthographic }
	];

	let serviceUrl = $.state(void 0);
	let zoomDelta = $.state(0);

	const colorScale = scaleOrdinal().range(schemeCategory10.map((hex) => {
		let c = color(hex);

		c.opacity = 0.5;

		return c.toString() ?? '';
	}));

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	SelectField(node, {
		label: 'Projections',
		get options() {
			return projections;
		},
		clearable: false,
		get value() {
			return $.get(projection);
		},

		set value($$value) {
			$.set(projection, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	TilesetField(node_1, {
		get serviceUrl() {
			return $.get(serviceUrl);
		},

		set serviceUrl($$value) {
			$.set(serviceUrl, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Zoom delta',
		min: -5,
		max: 5,
		get value() {
			return $.get(zoomDelta);
		},

		set value($$value) {
			$.set(zoomDelta, $$value, true);
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	{
		var consequent_2 = ($$anchor) => {
			{
				let $0 = $.derived(() => ({ projection: $.get(projection), fitGeojson: $.get(geojson) }));

				Chart($$anchor, {
					get geo() {
						return $.get($0);
					},
					transform: { mode: 'projection', scrollMode: 'scale' },
					padding: { top: 8, bottom: 8, left: 8, right: 8 },
					height: 600,
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_4 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								Layer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_5 = $.first_child(fragment_3);

										GeoTile(node_5, {
											get url() {
												return $.get(serviceUrl);
											},
											zoomDelta: -100
										});

										var node_6 = $.sibling(node_5, 2);

										GeoTile(node_6, {
											get url() {
												return $.get(serviceUrl);
											},
											zoomDelta: -4
										});

										var node_7 = $.sibling(node_6, 2);

										GeoTile(node_7, {
											get url() {
												return $.get(serviceUrl);
											},
											zoomDelta: -1
										});

										var node_8 = $.sibling(node_7, 2);

										GeoTile(node_8, {
											get url() {
												return $.get(serviceUrl);
											},

											get zoomDelta() {
												return $.get(zoomDelta);
											}
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_4, ($$render) => {
								if ($.get(projection) === geoMercator && $.get(serviceUrl)) $$render(consequent);
							});
						}

						var node_9 = $.sibling(node_4, 2);

						TransformControls(node_9, {});

						var node_10 = $.sibling(node_9, 2);

						Layer(node_10, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_11 = $.first_child(fragment_4);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_5 = $.comment();
										var node_12 = $.first_child(fragment_5);

										$.each(node_12, 17, () => $.get(geojson)?.features, $.index, ($$anchor, feature) => {
											{
												let $0 = $.derived(() => colorScale(String($.get(feature).id)));

												GeoPath($$anchor, {
													get geojson() {
														return $.get(feature);
													},

													get fill() {
														return $.get($0);
													},
													class: 'stroke-black',
													tooltip: true
												});
											}
										});

										$.append($$anchor, fragment_5);
									};

									$.if(node_11, ($$render) => {
										if ($.get(geojson)?.features) $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_13 = $.sibling(node_10, 2);

						{
							const children = ($$anchor, $$arg0) => {
								let data = () => ($$arg0?.()).data;
								var fragment_7 = $.comment();
								var node_14 = $.first_child(fragment_7);

								$.component(node_14, () => Tooltip.List, ($$anchor, Tooltip_List) => {
									Tooltip_List($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = $.comment();
											var node_15 = $.first_child(fragment_8);

											$.each(node_15, 17, () => Object.entries(data().properties), $.index, ($$anchor, $$item) => {
												var $$array = $.derived(() => $.to_array($.get($$item), 2));
												let key = () => $.get($$array)[0];
												let value = () => $.get($$array)[1];
												var fragment_9 = $.comment();
												var node_16 = $.first_child(fragment_9);

												$.component(node_16, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
													Tooltip_Item($$anchor, {
														get label() {
															return key();
														},

														get value() {
															return value();
														}
													});
												});

												$.append($$anchor, fragment_9);
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							};

							$.component(node_13, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
								Tooltip_Root($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			}
		};

		var alternate = ($$anchor) => {
			EmptyMessage($$anchor, {
				class: 'h-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Please enter input below');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_3, ($$render) => {
			if ($.get(geojson)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);

	var node_17 = $.sibling(div_2, 2);

	ToggleGroup(node_17, {
		variant: 'underline',
		classes: { options: 'justify-start h-10' },
		get value() {
			return $.get(selectedTab);
		},

		set value($$value) {
			$.set(selectedTab, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_1();
			var node_18 = $.first_child(fragment_11);

			ToggleOption(node_18, {
				value: 'input',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Input');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			ToggleOption(node_19, {
				value: 'geojson',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Parsed');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_17, 2);

	{
		var consequent_3 = ($$anchor) => {
			TextField($$anchor, {
				label: 'GeoJSON',
				placeholder: '{"type": "FeatureCollection", "features": [...] }',
				multiline: true,
				classes: { input: 'h-[400px]' },
				get value() {
					return $.get(geojsonStr);
				},

				set value($$value) {
					$.set(geojsonStr, $$value, true);
				}
			});
		};

		var consequent_4 = ($$anchor) => {
			Json($$anchor, {
				get value() {
					return $.get(geojson);
				}
			});
		};

		$.if(node_20, ($$render) => {
			if ($.get(selectedTab) === 'input') $$render(consequent_3); else if ($.get(selectedTab) === 'geojson') $$render(consequent_4, 1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}