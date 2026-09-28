import * as $ from 'svelte/internal/server';
import { tile as d3Tile } from 'd3-tile';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { getLayerContext } from '$lib/contexts/layer.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function GeoTile_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// @ts-expect-error
		let {
			Group,
			TileImage,
			url,
			zoomDelta = 0,
			tileSize = 256,
			disableCache = false,
			debug = false,
			group,
			children
		} = $$props;

		const ctx = getChartContext();
		const geo = getGeoContext();
		const layerCtx = getLayerContext();
		const center = $.derived(() => geo.projection?.([0, 0]) ?? [0, 0]);

		const tiles = $.derived(() => d3Tile().size([ctx.containerWidth, ctx.containerHeight]).translate([
			center()[0] + ctx.padding.left,
			center()[1] + ctx.padding.top
		]).scale(geo.projection ? geo.projection.scale() * 2 * Math.PI : undefined).tileSize(tileSize).zoomDelta(zoomDelta)());

		const translate = $.derived(() => tiles().translate);
		const scale = $.derived(() => tiles().scale);

		function render(ctx) {
			for (const [x, y, z] of tiles()) {
				const image = new Image();

				image.onload = () => {
					ctx.drawImage(image, (x + translate()[0]) * scale(), (y + translate()[1]) * scale(), scale(), scale());
				};

				image.src = url(x, y, z);
			}
		}

		if (layerCtx === 'canvas') {
			ctx.registerComponent({
				name: 'GeoTile',
				kind: 'mark',
				canvasRender: { render, deps: () => [tiles()] }
			});
		}

		if (layerCtx === 'svg' && url) {
			$$renderer.push('<!--[0-->');

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { tiles: tiles() });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (Group) {
					$$renderer.push('<!--[-->');

					Group($$renderer, $.spread_props([
						{ x: -ctx.padding.left, y: -ctx.padding.top },
						extractLayerProps(group, 'lc-geo-tile-group'),
						{
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(tiles());

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let [x, y, z] = each_array[$$index];

									if (TileImage) {
										$$renderer.push('<!--[-->');

										TileImage($$renderer, {
											url,
											x,
											y,
											z,
											tx: translate()[0],
											ty: translate()[1],
											scale: scale(),
											disableCache,
											debug
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}