import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoMercator, geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';
import { RangeField } from 'svelte-ux';
import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-[1fr_auto] gap-3 items-end mb-2"><!> <!></div> <!>`, 1);

export default function Tiles_globe($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);
	const TILE_SIZE = 256;
	let serviceUrl = $.state((x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
	let doubleScale = $.state(false);
	let zoom = $.state(2);

	// Stitched Web Mercator mosaic: one canvas covering the full world at the
	// selected zoom level. Re-fetched whenever `serviceUrl` or `zoom` changes.
	let mosaic = $.state(null);

	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		const url = $.get(serviceUrl);
		const z = $.get(zoom);
		let cancelled = false;

		async function stitch() {
			const tiles = 1 << z; // 2^z tiles per side
			const size = tiles * TILE_SIZE;
			const canvas = document.createElement('canvas');

			canvas.width = size;
			canvas.height = size;

			const ctx = canvas.getContext('2d');

			if (!ctx) return;

			await Promise.all(Array.from({ length: tiles }, (_, y) => Array.from({ length: tiles }, async (_, x) => {
				const img = new Image();

				img.crossOrigin = 'anonymous';
				img.src = url(x, y, z);

				try {
					await img.decode();
				} catch {
					return;
				}

				if (cancelled) return;

				ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			})).flat());

			if (cancelled) return;

			$.set(mosaic, canvas, true);
		}

		stitch();

		return () => {
			cancelled = true;
		};
	});

	// Source projection for the mosaic: Web Mercator sized to exactly match the
	// stitched canvas dimensions. Re-created when `zoom` changes.
	const sourceProjection = $.derived(() => () => {
		const size = (1 << $.get(zoom)) * TILE_SIZE;

		return geoMercator().scale(size / (2 * Math.PI)).translate([size / 2, size / 2]).precision(0);
	});

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	GeoTileControls(node, {
		get serviceUrl() {
			return $.get(serviceUrl);
		},

		set serviceUrl($$value) {
			$.set(serviceUrl, $$value, true);
		},

		get doubleScale() {
			return $.get(doubleScale);
		},

		set doubleScale($$value) {
			$.set(doubleScale, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Zoom',
		min: 0,
		max: 4,
		step: 1,
		get value() {
			return $.get(zoom);
		},

		set value($$value) {
			$.set(zoom, $$value, true);
		}
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: { type: 'Sphere' } }));

		Chart(node_2, {
			get geo() {
				return $.get($0);
			},

			transform: {
				mode: 'projection',
				constrain: ({ scale, translate }) => ({
					scale,
					translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
				})
			},
			padding: { top: 10, bottom: 10, left: 10, right: 10 },
			height: 500,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_3 = $.first_child(fragment_1);

				Layer(node_3, {
					type: 'canvas',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								GeoRaster($$anchor, {
									get image() {
										return $.get(mosaic);
									},

									get sourceProjection() {
										return $.get(sourceProjection);
									},
									interpolate: 'bilinear'
								});
							};

							$.if(node_4, ($$render) => {
								if ($.get(mosaic)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_3, 2);

				Layer(node_5, {
					type: 'svg',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_6 = $.first_child(fragment_4);

						GeoPath(node_6, {
							geojson: { type: 'Sphere' },
							class: 'fill-none stroke-surface-content/40'
						});

						var node_7 = $.sibling(node_6, 2);

						Graticule(node_7, { class: 'stroke-surface-content/15' });

						var node_8 = $.sibling(node_7, 2);

						$.each(node_8, 17, () => countries.features, $.index, ($$anchor, feature, $$index, $$array) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'fill-none stroke-surface-content/30'
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}