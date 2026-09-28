import * as $ from 'svelte/internal/server';
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

export default function Voronoi_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// @ts-expect-error
		// GeoPath lives in geo/ subpath; agnostic import (only used in geo charts).
		let {
			Group,
			Path,
			CircleClipPath,
			data,
			x: xProp,
			y: yProp,
			r,
			classes = {},
			onclick,
			onpointerenter,
			onpointerdown,
			onpointermove,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getChartContext();

		// `flatData` rather than the chart's `data`, so marks with their own rows are included
		const facetPanel = getFacetPanel();

		const geo = getGeoContext();
		const xAccessorOverride = $.derived(() => xProp != null ? accessor(xProp) : undefined);
		const yAccessorOverride = $.derived(() => yProp != null ? accessor(yProp) : undefined);

		const points = $.derived(() => (data ?? facetPanel?.().data ?? ctx.flatData).map((d) => {
			const xValue = xAccessorOverride()
				? geo.projection
					? xAccessorOverride()(d)
					: ctx.xScale(xAccessorOverride()(d))
				: geo.projection ? ctx.x(d) : ctx.xGet(d);

			const yValue = yAccessorOverride()
				? geo.projection
					? yAccessorOverride()(d)
					: ctx.yScale(yAccessorOverride()(d))
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
		const disableClip = $.derived(() => r === 0 || r == null || r === Infinity);

		// Compute once and share between cell rendering and the `children` cell payload
		const voronoi = $.derived(() => geo.projection
			? null
			: Delaunay.from(points()).voronoi([0, 0, boundWidth(), boundHeight()]));

		const geoPolygons = $.derived(() => geo.projection ? geoVoronoi().polygons(points()) : null);

		// Cell geometry exposed to the `children` snippet for custom rendering (e.g. labels).
		// Only computed when a `children` snippet is provided.
		const cells = $.derived(() => {
			if (!children) return [];

			if (geo.projection && geoPolygons()) {
				return geoPolygons().features.map((feature, index) => {
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

			if (voronoi()) {
				return points().map((point, index) => {
					const polygon = voronoi().cellPolygon(index);

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

		if (Group) {
			$$renderer.push('<!--[-->');

			Group($$renderer, $.spread_props([
				restProps,
				{
					class: cls('lc-voronoi-g', classes.root, className),
					children: ($$renderer) => {
						if (geo.projection) {
							$$renderer.push('<!--[0-->');

							if (geoPolygons()) {
								$$renderer.push(`<!--[0--><!--[-->`);

								const each_array = $.ensure_array_like(geoPolygons().features);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let feature = each_array[$$index];

									const point = r
										? geo.projection?.(feature.properties.sitecoordinates)
										: null;

									if (CircleClipPath) {
										$$renderer.push('<!--[-->');

										CircleClipPath($$renderer, {
											cx: point?.[0],
											cy: point?.[1],
											r: r ?? 0,
											disabled: point == null || disableClip(),
											children: ($$renderer) => {
												GeoPath($$renderer, {
													geojson: feature,
													class: ['lc-voronoi-geo-path', classes.path],
													onclick: (e) => onclick?.(e, { data: feature.properties.site.data, feature }),
													onpointerenter: (e) => onpointerenter?.(e, { data: feature.properties.site.data, feature }),
													onpointermove: (e) => onpointermove?.(e, { data: feature.properties.site.data, feature }),
													onpointerdown: (e) => onpointerdown?.(e, { data: feature.properties.site.data, feature }),
													ontouchmove: (e) => {
														e.preventDefault();
													}
												});
											},
											$$slots: { default: true }
										});

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
						} else if (voronoi()) {
							$$renderer.push(`<!--[1--><!--[-->`);

							const each_array_1 = $.ensure_array_like(points());

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let point = each_array_1[i];
								const pathData = voronoi().renderCell(i);

								if (pathData) {
									$$renderer.push('<!--[0-->');

									if (CircleClipPath) {
										$$renderer.push('<!--[-->');

										CircleClipPath($$renderer, {
											cx: point[0],
											cy: point[1],
											r: r ?? 0,
											disabled: disableClip(),
											children: ($$renderer) => {
												if (Path) {
													$$renderer.push('<!--[-->');

													Path($$renderer, {
														pathData,
														class: ['lc-voronoi-path', classes.path],
														onclick: (e) => onclick?.(e, { data: point.data, point }),
														onpointerenter: (e) => onpointerenter?.(e, { data: point.data, point }),
														onpointermove: (e) => onpointermove?.(e, { data: point.data, point }),
														onpointerdown: (e) => onpointerdown?.(e, { data: point.data, point }),
														ontouchmove: (e) => {
															e.preventDefault();
														}
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						children?.($$renderer, { cells: cells() });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}