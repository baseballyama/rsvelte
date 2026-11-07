import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { contourDensity } from 'd3-contour';
import { geoPath } from 'd3-geo';
import { scaleSequential } from 'd3-scale';
import { interpolateYlGnBu } from 'd3-scale-chromatic';
import { max } from 'd3-array';
import { accessor as resolveAccessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { isScaleOrdinal } from '$lib/utils/scales.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Path',
	'data',
	'x',
	'y',
	'weight',
	'bandwidth',
	'thresholds',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeWidth',
	'opacity',
	'class'
]);

export default function Density_base($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	const markData = getMarkData();
	const geo = getGeoContext();

	let bandwidth = $.prop($$props, 'bandwidth', 3, 20),
		thresholds = $.prop($$props, 'thresholds', 3, 20),
		restProps = $.rest_props($$props, rest_excludes);

	ctx.registerComponent({ name: 'Density', kind: 'composite-mark' });

	const xAccessor = $.derived(() => $$props.x ? resolveAccessor($$props.x) : ctx.x);
	const yAccessor = $.derived(() => $$props.y ? resolveAccessor($$props.y) : ctx.y);
	const weightAccessor = $.derived(() => $$props.weight ? resolveAccessor($$props.weight) : null);
	const data = $.derived(() => markData($$props.data));

	const contours = $.derived(() => {
		if (!$.get(data) || $.get(data).length === 0 || !ctx.width || !ctx.height) return [];

		const projection = geo.projection;

		const density = contourDensity().x((d) => {
			if (projection) {
				const p = projection([$.get(xAccessor)(d), $.get(yAccessor)(d)]);

				return p ? p[0] : 0;
			}

			return ctx.xScale($.get(xAccessor)(d));
		}).y((d) => {
			if (projection) {
				const p = projection([$.get(xAccessor)(d), $.get(yAccessor)(d)]);

				return p ? p[1] : 0;
			}

			return ctx.yScale($.get(yAccessor)(d));
		}).size([ctx.width, ctx.height]).bandwidth(bandwidth()).thresholds(thresholds());

		if ($.get(weightAccessor)) {
			density.weight((d) => $.get(weightAccessor)(d));
		}

		const filteredData = projection
			? $.get(data).filter((d) => projection([$.get(xAccessor)(d), $.get(yAccessor)(d)]) !== null)
			: $.get(data);

		return density(filteredData);
	});

	const pathGenerator = $.derived(geoPath);

	const colorScale = $.derived(() => {
		if ($$props.fill) return null;

		const maxValue = max($.get(contours), (d) => d.value) ?? 1;

		// Not an ordinal scale — `cScale` defaults to a `series` color lookup, which can't ramp
		if (ctx.cScale && !isScaleOrdinal(ctx.cScale)) {
			return ctx.cScale.copy().domain([0, maxValue]);
		}

		return scaleSequential([0, maxValue], interpolateYlGnBu);
	});

	function getContourFill(contour) {
		if ($$props.fill) return $$props.fill;

		return $.get(colorScale)
			? String($.get(colorScale)(contour.value))
			: 'steelblue';
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $$props.Group, ($$anchor, Group_1) => {
				Group_1($$anchor, {
					class: 'lc-density',
					get opacity() {
						return $$props.opacity;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 17, () => $.get(contours), $.index, ($$anchor, contour) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => $.get(pathGenerator)($.get(contour)) ?? '');
								let $1 = $.derived(() => getContourFill($.get(contour)));
								let $2 = $.derived(() => cls('lc-density-contour', $$props.class));

								$.component(node_3, () => $$props.Path, ($$anchor, Path_1) => {
									Path_1($$anchor, {
										get pathData() {
											return $.get($0);
										},

										get fill() {
											return $.get($1);
										},

										get fillOpacity() {
											return $$props.fillOpacity;
										},

										get stroke() {
											return $$props.stroke;
										},

										get strokeWidth() {
											return $$props.strokeWidth;
										},

										get class() {
											return $.get($2);
										}
									});
								});
							}

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(contours).length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}