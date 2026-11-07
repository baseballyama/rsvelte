import * as $ from 'svelte/internal/server';

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

export default function Shapefile_preview($$renderer) {
	let file = '';
	let geojson = null;
	let loading = false;
	let error = '';

	async function loadFile(url = file) {
		file = url;

		if (!url) return;

		loading = true;
		error = '';

		try {
			// Imported lazily so the shapefile parser is only fetched (and only ever runs) in the browser
			const { read } = await import('shapefile');

			// Reads the binary `.shp` along with the sibling `.dbf` (feature properties), if available
			geojson = await read(url);
		} catch(e) {
			geojson = null;
			error = e instanceof Error ? e.message : 'Unable to read shapefile';
		} finally {
			loading = false;
		}
	}

	let projection = geoIdentity;

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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="grid gap-2"><div class="grid grid-cols-[1fr_auto] gap-2 items-center">`);

		TextField($$renderer, {
			label: 'File',
			error,
			placeholder: 'Please specify a file or load an example',
			get value() {
				return file;
			},

			set value($$value) {
				file = $$value;
				$$settled = false;
			},

			$$slots: {
				append: ($$renderer) => {
					$$renderer.push(`<div slot="append">`);

					ButtonGroup($$renderer, {
						variant: 'fill-outline',
						color: 'primary',
						children: ($$renderer) => {
							Button($$renderer, {
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Load file`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Toggle($$renderer, {
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { on: open, toggle }) => {
										$$renderer.push(`<span class="flex">`);
										Button($$renderer, { icon: LucideChevronDown, rounded: true, class: 'px-1' });
										$$renderer.push(`<!----> `);

										Menu($$renderer, {
											open,
											placement: 'bottom-end',
											children: ($$renderer) => {
												MenuItem($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Load basic example`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												MenuItem($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Load complex example`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></span>`);
									}
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> `);

		SelectField($$renderer, {
			label: 'Projections',
			options: projections,
			clearable: false,
			toggleIcon: null,
			stepper: true,
			get value() {
				return projection;
			},

			set value($$value) {
				projection = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <div class="h-[600px]">`);

		if (geojson) {
			$$renderer.push('<!--[0-->');

			Chart($$renderer, {
				geo: { projection, fitGeojson: geojson },
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, { geojson, fill: 'white' });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');

			EmptyMessage($$renderer, {
				class: 'h-full',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Please specify a file`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}