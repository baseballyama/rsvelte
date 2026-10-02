import * as $ from 'svelte/internal/server';
import { min } from 'd3-array';
import { Delaunay } from 'd3-delaunay';
import { geoVoronoi } from 'd3-geo-voronoi';
import { curveLinearClosed } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import GeoPath from '../geo/GeoPath/GeoPath.svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { getFacetPanel } from '$lib/contexts/facet.js';
import { getGeoContext } from '$lib/contexts/geo.js';

export default function Hull_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// @ts-expect-error - no types available
		// GeoPath agnostic; only loaded when used inside a geo chart.
		const ctx = getChartContext();

		// `flatData` rather than the chart's `data`, so marks with their own rows are included
		const facetPanel = getFacetPanel();

		const geo = getGeoContext();

		ctx.registerComponent({ name: 'Hull', kind: 'composite-mark' });

		let {
			Group,
			Spline,
			data,
			curve = curveLinearClosed,
			classes = {},
			onpointermove,
			onclick,
			onpointerleave,
			fill,
			fillOpacity,
			stroke,
			strokeOpacity,
			strokeWidth,
			opacity,
			class: className,
			ref: refProp = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;

		const points = $.derived(() => (data ?? facetPanel?.().data ?? ctx.flatData).map((d) => {
			const xValue = ctx.x(d);
			const yValue = ctx.y(d);
			const x = Array.isArray(xValue) ? min(xValue) : xValue;
			const y = Array.isArray(yValue) ? min(yValue) : yValue;
			const point = [x, y];

			// @ts-expect-error
			point.data = d;

			return point;
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Group) {
				$$renderer.push('<!--[-->');

				Group($$renderer, $.spread_props([
					restProps,
					{
						class: cls('lc-hull-g', classes.root, className),
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (geo.projection) {
								$$renderer.push('<!--[0-->');

								const polygon = geoVoronoi().hull(points());

								GeoPath($$renderer, {
									geojson: polygon,
									curve,
									fill,
									fillOpacity,
									stroke,
									strokeOpacity,
									strokeWidth,
									opacity,
									class: ['lc-hull-path', classes.path],
									onclick: (e) => onclick?.(e, { points: points(), polygon }),
									onpointermove: (e) => onpointermove?.(e, { points: points(), polygon }),
									onpointerleave
								});
							} else {
								$$renderer.push('<!--[-1-->');

								const delaunay = Delaunay.from(points());
								const polygon = delaunay.hullPolygon();

								if (Spline) {
									$$renderer.push('<!--[-->');

									Spline($$renderer, {
										data: polygon,
										x: (d) => d[0],
										y: (d) => d[1],
										curve,
										fill,
										fillOpacity,
										stroke,
										strokeOpacity,
										strokeWidth,
										opacity,
										class: ['lc-hull-class', classes.path],
										onclick: (e) => onclick?.(e, { points: points(), polygon }),
										onpointermove: (e) => onpointermove?.(e, { points: points(), polygon }),
										onpointerleave
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref: refProp });
	});
}