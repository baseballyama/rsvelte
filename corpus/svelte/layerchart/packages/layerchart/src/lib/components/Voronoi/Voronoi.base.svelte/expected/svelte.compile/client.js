import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { max } from 'd3-array';
import { Delaunay } from 'd3-delaunay';
import { geoArea, geoCentroid } from 'd3-geo';
import { geoVoronoi } from 'd3-geo-voronoi';
import { polygonArea, polygonCentroid } from 'd3-polygon';
import { pointRadial } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import GeoPath from '../geo/GeoPath/GeoPath.svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { getFacetPanel } from '$lib/contexts/facet.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { accessor } from '$lib/utils/common.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Path',
	'CircleClipPath',
	'data',
	'x',
	'y',
	'r',
	'classes',
	'onclick',
	'onpointerenter',
	'onpointerdown',
	'onpointermove',
	'class',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Voronoi_base($$anchor, $$props) {
	$.push($$props, true);

	// @ts-expect-error
	// GeoPath lives in geo/ subpath; agnostic import (only used in geo charts).
	let classes = $.prop($$props, 'classes', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	const ctx = getChartContext();

	// `flatData` rather than the chart's `data`, so marks with their own rows are included
	const facetPanel = getFacetPanel();

	const geo = getGeoContext();
	const xAccessorOverride = $.derived(() => $$props.x != null ? accessor($$props.x) : undefined);
	const yAccessorOverride = $.derived(() => $$props.y != null ? accessor($$props.y) : undefined);

	const points = $.derived(() => ($$props.data ?? facetPanel?.().data ?? ctx.flatData).map((d) => {
		const xValue = $.get(xAccessorOverride)
			? geo.projection
				? $.get(xAccessorOverride)(d)
				: ctx.xScale($.get(xAccessorOverride)(d))
			: geo.projection ? ctx.x(d) : ctx.xGet(d);

		const yValue = $.get(yAccessorOverride)
			? geo.projection
				? $.get(yAccessorOverride)(d)
				: ctx.yScale($.get(yAccessorOverride)(d))
			: geo.projection ? ctx.y(d) : ctx.yGet(d);

		const x = Array.isArray(xValue) ? max(xValue) : xValue;
		const y = Array.isArray(yValue) ? max(yValue) : yValue;
		let point;

		if (ctx.radial) {
			const radialPoint = pointRadial(x, y);

			point = [
				radialPoint[0] + ctx.width / 2,
				radialPoint[1] + ctx.height / 2
			];
		} else {
			point = [x, y];
		}

		// @ts-expect-error
		point.data = d;

		return point;
	}));

	const boundWidth = $.derived(() => Math.max(ctx.width, 0));
	const boundHeight = $.derived(() => Math.max(ctx.height, 0));
	const disableClip = $.derived(() => $$props.r === 0 || $$props.r == null || $$props.r === Infinity);

	// Compute once and share between cell rendering and the `children` cell payload
	const voronoi = $.derived(() => geo.projection
		? null
		: Delaunay.from($.get(points)).voronoi([0, 0, $.get(boundWidth), $.get(boundHeight)]));

	const geoPolygons = $.derived(() => geo.projection ? geoVoronoi().polygons($.get(points)) : null);

	// Cell geometry exposed to the `children` snippet for custom rendering (e.g. labels).
	// Only computed when a `children` snippet is provided.
	const cells = $.derived(() => {
		if (!$$props.children) return [];

		if (geo.projection && $.get(geoPolygons)) {
			return $.get(geoPolygons).features.map((feature, index) => {
				const projectedPoint = geo.projection?.(feature.properties.sitecoordinates) ?? null;
				const ring = (feature.geometry?.coordinates?.[0] ?? []).map((coord) => geo.projection?.(coord)).filter((p) => p != null);
				const polygon = ring.length ? ring : null;

				// Use spherical centroid/area (projected) rather than the projected ring, which
				// tears across the antimeridian and yields a garbage centroid for large cells.
				const projectedCentroid = geo.projection?.(geoCentroid(feature)) ?? null;

				return {
					data: feature.properties.site?.data,
					index,
					point: projectedPoint ?? [NaN, NaN],
					polygon,
					centroid: projectedCentroid && Number.isFinite(projectedCentroid[0]) ? projectedCentroid : null,
					// Spherical area (steradians) — see `VoronoiCell.area`
					area: geoArea(feature)
				};
			});
		}

		if ($.get(voronoi)) {
			return $.get(points).map((point, index) => {
				const polygon = $.get(voronoi).cellPolygon(index);

				return {
					data: point.data,
					index,
					point: [point[0], point[1]],
					polygon,
					centroid: polygon ? polygonCentroid(polygon) : null,
					area: polygon ? Math.abs(polygonArea(polygon)) : 0
				};
			});
		}

		return [];
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cls('lc-voronoi-g', classes().root, $$props.class));

		$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
			Group_1($$anchor, $.spread_props(() => restProps, {
				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.each(node_3, 17, () => $.get(geoPolygons).features, $.index, ($$anchor, feature) => {
										const point = $.derived(() => $$props.r
											? geo.projection?.($.get(feature).properties.sitecoordinates)
											: null);

										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										{
											let $0 = $.derived(() => $.get(point)?.[0]);
											let $1 = $.derived(() => $.get(point)?.[1]);
											let $2 = $.derived(() => $$props.r ?? 0);
											let $3 = $.derived(() => $.get(point) == null || $.get(disableClip));

											$.component(node_4, () => $$props.CircleClipPath, ($$anchor, CircleClipPath_1) => {
												CircleClipPath_1($$anchor, {
													get cx() {
														return $.get($0);
													},

													get cy() {
														return $.get($1);
													},

													get r() {
														return $.get($2);
													},

													get disabled() {
														return $.get($3);
													},

													children: ($$anchor, $$slotProps) => {
														{
															let $0 = $.derived(() => ['lc-voronoi-geo-path', classes().path]);

															GeoPath($$anchor, {
																get geojson() {
																	return $.get(feature);
																},

																get class() {
																	return $.get($0);
																},

																onclick: (e) => $$props.onclick?.(e, {
																	data: $.get(feature).properties.site.data,
																	feature: $.get(feature)
																}),

																onpointerenter: (e) => $$props.onpointerenter?.(e, {
																	data: $.get(feature).properties.site.data,
																	feature: $.get(feature)
																}),

																onpointermove: (e) => $$props.onpointermove?.(e, {
																	data: $.get(feature).properties.site.data,
																	feature: $.get(feature)
																}),

																onpointerdown: (e) => $$props.onpointerdown?.(e, {
																	data: $.get(feature).properties.site.data,
																	feature: $.get(feature)
																}),

																ontouchmove: (e) => {
																	e.preventDefault();
																}
															});
														}
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_4);
									});

									$.append($$anchor, fragment_3);
								};

								$.if(node_2, ($$render) => {
									if ($.get(geoPolygons)) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_2);
						};

						var consequent_3 = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							$.each(node_5, 17, () => $.get(points), $.index, ($$anchor, point, i) => {
								const pathData = $.derived(() => $.get(voronoi).renderCell(i));
								var fragment_7 = $.comment();
								var node_6 = $.first_child(fragment_7);

								{
									var consequent_2 = ($$anchor) => {
										var fragment_8 = $.comment();
										var node_7 = $.first_child(fragment_8);

										{
											let $0 = $.derived(() => $$props.r ?? 0);

											$.component(node_7, () => $$props.CircleClipPath, ($$anchor, CircleClipPath_2) => {
												CircleClipPath_2($$anchor, {
													get cx() {
														return $.get(point)[0];
													},

													get cy() {
														return $.get(point)[1];
													},

													get r() {
														return $.get($0);
													},

													get disabled() {
														return $.get(disableClip);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_8 = $.first_child(fragment_9);

														{
															let $0 = $.derived(() => ['lc-voronoi-path', classes().path]);

															$.component(node_8, () => $$props.Path, ($$anchor, Path_1) => {
																Path_1($$anchor, {
																	get pathData() {
																		return $.get(pathData);
																	},

																	get class() {
																		return $.get($0);
																	},
																	onclick: (e) => $$props.onclick?.(e, { data: $.get(point).data, point: $.get(point) }),
																	onpointerenter: (e) => $$props.onpointerenter?.(e, { data: $.get(point).data, point: $.get(point) }),
																	onpointermove: (e) => $$props.onpointermove?.(e, { data: $.get(point).data, point: $.get(point) }),
																	onpointerdown: (e) => $$props.onpointerdown?.(e, { data: $.get(point).data, point: $.get(point) }),
																	ontouchmove: (e) => {
																		e.preventDefault();
																	}
																});
															});
														}

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_8);
									};

									$.if(node_6, ($$render) => {
										if ($.get(pathData)) $$render(consequent_2);
									});
								}

								$.append($$anchor, fragment_7);
							});

							$.append($$anchor, fragment_6);
						};

						$.if(node_1, ($$render) => {
							if (geo.projection) $$render(consequent_1); else if ($.get(voronoi)) $$render(consequent_3, 1);
						});
					}

					var node_9 = $.sibling(node_1, 2);

					$.snippet(node_9, () => $$props.children ?? $.noop, () => ({ cells: $.get(cells) }));
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}