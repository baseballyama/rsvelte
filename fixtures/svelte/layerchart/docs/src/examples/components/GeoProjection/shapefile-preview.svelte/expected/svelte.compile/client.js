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

import { Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';

import {
	Button,
	ButtonGroup,
	EmptyMessage,
	Menu,
	MenuItem,
	SelectField,
	TextField,
	Toggle
} from 'svelte-ux';

import LucideChevronDown from '~icons/lucide/chevron-down';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="flex"><!> <!></span>`);
var root_2 = $.from_html(`<div slot="append"><!></div>`);
var root_3 = $.from_html(`<div class="grid gap-2"><div class="grid grid-cols-[1fr_auto] gap-2 items-center"><!> <!></div> <div class="h-[600px]"><!></div></div>`);

export default function Shapefile_preview($$anchor) {
	let file = $.state('');
	let geojson = $.state(null);
	let loading = $.state(false);
	let error = $.state('');

	async function loadFile(url = $.get(file)) {
		$.set(file, url, true);

		if (!url) return;

		$.set(loading, true);
		$.set(error, '');

		try {
			// Imported lazily so the shapefile parser is only fetched (and only ever runs) in the browser
			const { read } = await import('shapefile');

			// Reads the binary `.shp` along with the sibling `.dbf` (feature properties), if available
			$.set(geojson, await read(url), true);
		} catch(e) {
			$.set(geojson, null);
			$.set(error, e instanceof Error ? e.message : 'Unable to read shapefile', true);
		} finally {
			$.set(loading, false);
		}
	}

	let projection = $.state($.proxy(geoIdentity));

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

	var div = root_3();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	TextField(node, {
		label: 'File',
		get error() {
			return $.get(error);
		},
		placeholder: 'Please specify a file or load an example',
		get value() {
			return $.get(file);
		},

		set value($$value) {
			$.set(file, $$value, true);
		},

		$$slots: {
			append: ($$anchor, $$slotProps) => {
				var div_2 = root_2();
				var node_1 = $.child(div_2);

				ButtonGroup(node_1, {
					variant: 'fill-outline',
					color: 'primary',
					children: ($$anchor, $$slotProps) => {
						var fragment = root();
						var node_2 = $.first_child(fragment);

						Button(node_2, {
							get loading() {
								return $.get(loading);
							},
							$$events: { click: () => loadFile() },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Load file');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						Toggle(node_3, {
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									const open = $.derived(() => $$slotProps.on);
									const toggle = $.derived(() => $$slotProps.toggle);
									var span = root_1();
									var node_4 = $.child(span);

									Button(node_4, {
										get icon() {
											return LucideChevronDown;
										},
										rounded: true,
										class: 'px-1',
										$$events: {
											click: function (...$$args) {
												$.get(toggle)?.apply(this, $$args);
											}
										}
									});

									var node_5 = $.sibling(node_4, 2);

									Menu(node_5, {
										get open() {
											return $.get(open);
										},
										placement: 'bottom-end',
										$$events: {
											close: function (...$$args) {
												$.get(toggle)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_1 = root();
											var node_6 = $.first_child(fragment_1);

											MenuItem(node_6, {
												$$events: {
													click: () => {
														loadFile('https://cdn.jsdelivr.net/gh/mbostock/shapefile@master/test/points.shp');
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Load basic example');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});

											var node_7 = $.sibling(node_6, 2);

											MenuItem(node_7, {
												$$events: {
													click: () => {
														loadFile('https://cdn.jsdelivr.net/gh/matplotlib/basemap@v1.1.0/lib/mpl_toolkits/basemap/data/UScounties.shp');
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Load complex example');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_1);
										},
										$$slots: { default: true }
									});

									$.reset(span);
									$.append($$anchor, span);
								}
							}
						});

						$.append($$anchor, fragment);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			}
		}
	});

	var node_8 = $.sibling(node, 2);

	SelectField(node_8, {
		label: 'Projections',
		get options() {
			return projections;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return $.get(projection);
		},

		set value($$value) {
			$.set(projection, $$value, true);
		}
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_9 = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => ({ projection: $.get(projection), fitGeojson: $.get(geojson) }));

				Chart($$anchor, {
					get geo() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						Layer($$anchor, {
							children: ($$anchor, $$slotProps) => {
								GeoPath($$anchor, {
									get geojson() {
										return $.get(geojson);
									},
									fill: 'white'
								});
							},
							$$slots: { default: true }
						});
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

					var text_3 = $.text('Please specify a file');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_9, ($$render) => {
			if ($.get(geojson)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}