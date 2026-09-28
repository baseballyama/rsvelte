import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tile as d3Tile } from 'd3-tile';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { getLayerContext } from '$lib/contexts/layer.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function GeoTile_base($$anchor, $$props) {
	$.push($$props, true);

	// @ts-expect-error
	let zoomDelta = $.prop($$props, 'zoomDelta', 3, 0),
		tileSize = $.prop($$props, 'tileSize', 3, 256),
		disableCache = $.prop($$props, 'disableCache', 3, false),
		debug = $.prop($$props, 'debug', 3, false);

	const ctx = getChartContext();
	const geo = getGeoContext();
	const layerCtx = getLayerContext();
	const center = $.derived(() => geo.projection?.([0, 0]) ?? [0, 0]);

	const tiles = $.derived(() => d3Tile().size([ctx.containerWidth, ctx.containerHeight]).translate([
		$.get(center)[0] + ctx.padding.left,
		$.get(center)[1] + ctx.padding.top
	]).scale(geo.projection ? geo.projection.scale() * 2 * Math.PI : undefined).tileSize(tileSize()).zoomDelta(zoomDelta())());

	const translate = $.derived(() => $.get(tiles).translate);
	const scale = $.derived(() => $.get(tiles).scale);

	function render(ctx) {
		for (const [x, y, z] of $.get(tiles)) {
			const image = new Image();

			image.onload = () => {
				ctx.drawImage(image, (x + $.get(translate)[0]) * $.get(scale), (y + $.get(translate)[1]) * $.get(scale), $.get(scale), $.get(scale));
			};

			image.src = $$props.url(x, y, z);
		}
	}

	if (layerCtx === 'canvas') {
		ctx.registerComponent({
			name: 'GeoTile',
			kind: 'mark',
			canvasRender: { render, deps: () => [$.get(tiles)] }
		});
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.snippet(node_2, () => $$props.children, () => ({ tiles: $.get(tiles) }));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					{
						let $0 = $.derived(() => -ctx.padding.left);
						let $1 = $.derived(() => -ctx.padding.top);
						let $2 = $.derived(() => extractLayerProps($$props.group, 'lc-geo-tile-group'));

						$.component(node_3, () => $$props.Group, ($$anchor, Group_1) => {
							Group_1($$anchor, $.spread_props(
								{
									get x() {
										return $.get($0);
									},

									get y() {
										return $.get($1);
									}
								},
								() => $.get($2),
								{
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.each(node_4, 17, () => $.get(tiles), ([x, y, z]) => $$props.url(x, y, z), ($$anchor, $$item) => {
											var $$array = $.derived(() => $.to_array($.get($$item), 3));
											let x = () => $.get($$array)[0];
											let y = () => $.get($$array)[1];
											let z = () => $.get($$array)[2];
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											$.component(node_5, () => $$props.TileImage, ($$anchor, TileImage_1) => {
												TileImage_1($$anchor, {
													get url() {
														return $$props.url;
													},

													get x() {
														return x();
													},

													get y() {
														return y();
													},

													get z() {
														return z();
													},

													get tx() {
														return $.get(translate)[0];
													},

													get ty() {
														return $.get(translate)[1];
													},

													get scale() {
														return $.get(scale);
													},

													get disableCache() {
														return disableCache();
													},

													get debug() {
														return debug();
													}
												});
											});

											$.append($$anchor, fragment_5);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}
							));
						});
					}

					$.append($$anchor, fragment_3);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'svg' && $$props.url) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}