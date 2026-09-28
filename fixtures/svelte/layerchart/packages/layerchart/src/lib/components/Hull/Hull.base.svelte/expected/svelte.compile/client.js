import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { min } from 'd3-array';
import { Delaunay } from 'd3-delaunay';
import { geoVoronoi } from 'd3-geo-voronoi';
import { curveLinearClosed } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import GeoPath from '../geo/GeoPath/GeoPath.svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { getFacetPanel } from '$lib/contexts/facet.js';
import { getGeoContext } from '$lib/contexts/geo.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Spline',
	'data',
	'curve',
	'classes',
	'onpointermove',
	'onclick',
	'onpointerleave',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeOpacity',
	'strokeWidth',
	'opacity',
	'class',
	'ref'
]);

export default function Hull_base($$anchor, $$props) {
	$.push($$props, true);

	// @ts-expect-error - no types available
	// GeoPath agnostic; only loaded when used inside a geo chart.
	const ctx = getChartContext();

	// `flatData` rather than the chart's `data`, so marks with their own rows are included
	const facetPanel = getFacetPanel();

	const geo = getGeoContext();

	ctx.registerComponent({ name: 'Hull', kind: 'composite-mark' });

	let curve = $.prop($$props, 'curve', 3, curveLinearClosed),
		classes = $.prop($$props, 'classes', 19, () => ({})),
		refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const points = $.derived(() => ($$props.data ?? facetPanel?.().data ?? ctx.flatData).map((d) => {
		const xValue = ctx.x(d);
		const yValue = ctx.y(d);
		const x = Array.isArray(xValue) ? min(xValue) : xValue;
		const y = Array.isArray(yValue) ? min(yValue) : yValue;
		const point = [x, y];

		// @ts-expect-error
		point.data = d;

		return point;
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cls('lc-hull-g', classes().root, $$props.class));

		$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
			Group_1($$anchor, $.spread_props(() => restProps, {
				get class() {
					return $.get($0);
				},

				get ref() {
					return $.get(ref);
				},

				set ref($$value) {
					$.set(ref, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							const polygon = $.derived(() => geoVoronoi().hull($.get(points)));

							{
								let $0 = $.derived(() => ['lc-hull-path', classes().path]);

								GeoPath($$anchor, {
									get geojson() {
										return $.get(polygon);
									},

									get curve() {
										return curve();
									},

									get fill() {
										return $$props.fill;
									},

									get fillOpacity() {
										return $$props.fillOpacity;
									},

									get stroke() {
										return $$props.stroke;
									},

									get strokeOpacity() {
										return $$props.strokeOpacity;
									},

									get strokeWidth() {
										return $$props.strokeWidth;
									},

									get opacity() {
										return $$props.opacity;
									},

									get class() {
										return $.get($0);
									},
									onclick: (e) => $$props.onclick?.(e, { points: $.get(points), polygon: $.get(polygon) }),
									onpointermove: (e) => $$props.onpointermove?.(e, { points: $.get(points), polygon: $.get(polygon) }),
									get onpointerleave() {
										return $$props.onpointerleave;
									}
								});
							}
						};

						var alternate = ($$anchor) => {
							const delaunay = $.derived(() => Delaunay.from($.get(points)));
							const polygon = $.derived(() => $.get(delaunay).hullPolygon());
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => ['lc-hull-class', classes().path]);

								$.component(node_2, () => $$props.Spline, ($$anchor, Spline_1) => {
									Spline_1($$anchor, {
										get data() {
											return $.get(polygon);
										},
										x: (d) => d[0],
										y: (d) => d[1],
										get curve() {
											return curve();
										},

										get fill() {
											return $$props.fill;
										},

										get fillOpacity() {
											return $$props.fillOpacity;
										},

										get stroke() {
											return $$props.stroke;
										},

										get strokeOpacity() {
											return $$props.strokeOpacity;
										},

										get strokeWidth() {
											return $$props.strokeWidth;
										},

										get opacity() {
											return $$props.opacity;
										},

										get class() {
											return $.get($0);
										},
										onclick: (e) => $$props.onclick?.(e, { points: $.get(points), polygon: $.get(polygon) }),
										onpointermove: (e) => $$props.onpointermove?.(e, { points: $.get(points), polygon: $.get(polygon) }),
										get onpointerleave() {
											return $$props.onpointerleave;
										}
									});
								});
							}

							$.append($$anchor, fragment_3);
						};

						$.if(node_1, ($$render) => {
							if (geo.projection) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}