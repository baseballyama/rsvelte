import * as $ from 'svelte/internal/server';
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

export default function Density_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();
		const markData = getMarkData();
		const geo = getGeoContext();

		let {
			Group,
			Path,
			data: dataProp,
			x: xProp,
			y: yProp,
			weight: weightProp,
			bandwidth = 20,
			thresholds = 20,
			fill,
			fillOpacity,
			stroke,
			strokeWidth,
			opacity,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		ctx.registerComponent({ name: 'Density', kind: 'composite-mark' });

		const xAccessor = $.derived(() => xProp ? resolveAccessor(xProp) : ctx.x);
		const yAccessor = $.derived(() => yProp ? resolveAccessor(yProp) : ctx.y);
		const weightAccessor = $.derived(() => weightProp ? resolveAccessor(weightProp) : null);
		const data = $.derived(() => markData(dataProp));

		const contours = $.derived(() => {
			if (!data() || data().length === 0 || !ctx.width || !ctx.height) return [];

			const projection = geo.projection;

			const density = contourDensity().x((d) => {
				if (projection) {
					const p = projection([xAccessor()(d), yAccessor()(d)]);

					return p ? p[0] : 0;
				}

				return ctx.xScale(xAccessor()(d));
			}).y((d) => {
				if (projection) {
					const p = projection([xAccessor()(d), yAccessor()(d)]);

					return p ? p[1] : 0;
				}

				return ctx.yScale(yAccessor()(d));
			}).size([ctx.width, ctx.height]).bandwidth(bandwidth).thresholds(thresholds);

			if (weightAccessor()) {
				density.weight((d) => weightAccessor()(d));
			}

			const filteredData = projection
				? data().filter((d) => projection([xAccessor()(d), yAccessor()(d)]) !== null)
				: data();

			return density(filteredData);
		});

		const pathGenerator = $.derived(geoPath);

		const colorScale = $.derived(() => {
			if (fill) return null;

			const maxValue = max(contours(), (d) => d.value) ?? 1;

			// Not an ordinal scale — `cScale` defaults to a `series` color lookup, which can't ramp
			if (ctx.cScale && !isScaleOrdinal(ctx.cScale)) {
				return ctx.cScale.copy().domain([0, maxValue]);
			}

			return scaleSequential([0, maxValue], interpolateYlGnBu);
		});

		function getContourFill(contour) {
			if (fill) return fill;

			return colorScale() ? String(colorScale()(contour.value)) : 'steelblue';
		}

		if (contours().length > 0) {
			$$renderer.push('<!--[0-->');

			if (Group) {
				$$renderer.push('<!--[-->');

				Group($$renderer, {
					class: 'lc-density',
					opacity,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(contours());

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let contour = each_array[i];

							if (Path) {
								$$renderer.push('<!--[-->');

								Path($$renderer, {
									pathData: pathGenerator()(contour) ?? '',
									fill: getContourFill(contour),
									fillOpacity,
									stroke,
									strokeWidth,
									class: cls('lc-density-contour', className)
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
	});
}