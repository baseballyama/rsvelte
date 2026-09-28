import * as $ from 'svelte/internal/server';
import { geoDistance } from 'd3-geo';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { getChartContext } from '$lib/contexts/chart.js';
import { asAny } from '$lib/utils/types.js';

export default function GeoLegend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			units = 'mi',
			variant = 'bracket',
			distance: distanceProp,
			ticks = 4,
			labelPlacement = 'bottom',
			tickFormat: tickFormatProp,
			tickFontSize = 10,
			titleFontSize = 10,
			height = 4,
			title = '',
			referencePoint,
			referenceScale,
			placement,
			color = 'currentColor',
			classes = {},
			ref: refProp = void 0,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		const ctx = getChartContext();

		// Earth radius in the selected units
		const earthRadius = $.derived(() => units === 'mi' ? 3958.8 : 6371);

		// Pixels per unit at the reference point on the current projection.
		// `null` if no projection or invert is unavailable (or numerically degenerate).
		const pixelsPerUnit = $.derived(() => {
			const projection = ctx.geo?.projection;

			if (!projection) return null;

			let pxPerUnit;

			if (referenceScale != null) {
				// Pre-projected data path (e.g. `geoIdentity` + us-atlas
				// `counties-albers-10m`): `projection.invert` returns topology pixel
				// coordinates, not lon/lat, so `geoDistance` can't be used. Instead,
				// combine the chart's fit scale with the known base projection scale:
				//   topology units per chart px = 1 / fitScale
				//   radians per topology unit   = 1 / referenceScale
				//   units (mi/km) per radian    = earthRadius
				// => px per unit = (fitScale * referenceScale) / earthRadius
				const fitScale = typeof projection.scale === 'function' ? projection.scale() : null;

				if (fitScale == null || !Number.isFinite(fitScale) || fitScale === 0) return null;

				pxPerUnit = fitScale * referenceScale / earthRadius();
			} else {
				if (typeof projection.invert !== 'function') return null;

				const refPx = referencePoint ?? [ctx.width / 2, ctx.height / 2];
				const a = projection.invert(refPx);
				const b = projection.invert([refPx[0] + 1, refPx[1]]);

				if (!a || !b) return null;
				if (!Number.isFinite(a[0]) || !Number.isFinite(b[0])) return null;

				const radiansPerPx = geoDistance(a, b);

				if (!Number.isFinite(radiansPerPx) || radiansPerPx === 0) return null;

				const unitsPerPx = radiansPerPx * earthRadius();

				pxPerUnit = 1 / unitsPerPx;
			}

			// In `canvas` transform mode the projection itself is not re-scaled — the
			// rendered output is visually scaled by `ctx.transform.scale`, so we need
			// to multiply to keep the bar consistent with what the user sees.
			if (ctx.transform?.mode === 'canvas') {
				pxPerUnit *= ctx.transform.scale ?? 1;
			}

			return pxPerUnit;
		});

		function niceDistance(d) {
			if (!(d > 0)) return 0;

			const exp = Math.floor(Math.log10(d));
			const base = Math.pow(10, exp);
			const mantissa = d / base;
			let nice;

			if (mantissa < 1.5) nice = 1; else if (mantissa < 3) nice = 2; else if (mantissa < 7) nice = 5; else nice = 10;

			return nice * base;
		}

		const distance = $.derived(() => {
			if (distanceProp != null) return distanceProp;
			if (pixelsPerUnit() == null) return 0;

			const viewportUnits = ctx.width / pixelsPerUnit();

			return niceDistance(viewportUnits * 0.25);
		});

		const barWidth = $.derived(() => pixelsPerUnit() && distance() > 0 ? distance() * pixelsPerUnit() : 0);

		const tickValues = $.derived(() => {
			if (distance() <= 0) return [];

			return Array.from({ length: ticks + 1 }, (_, i) => distance() * i / ticks);
		});

		function formatTick(value) {
			if (typeof tickFormatProp === 'function') return tickFormatProp(value);
			if (tickFormatProp) return format(value, asAny(tickFormatProp));

			// Default: append unit on the last tick only
			return value === distance() ? `${value} ${units}` : String(value);
		}

		const padding = 2;
		const titleHeight = $.derived(() => title ? titleFontSize + 6 : 0);
		const tickLabelHeight = $.derived(() => tickFontSize + 3);
		const width = $.derived(() => Math.ceil(barWidth()) + padding * 2);
		const svgHeight = $.derived(() => titleHeight() + height + tickLabelHeight() + padding * 2 + 3);

		const barY = $.derived(() => labelPlacement === 'top'
			? titleHeight() + padding + tickLabelHeight()
			: titleHeight() + padding);

		const tickLabelY = $.derived(() => labelPlacement === 'top'
			? titleHeight() + padding + tickFontSize
			: barY() + height + 3 + tickFontSize);

		// Single path for the `bracket` variant: outer bracket as one continuous
		// polyline (so corners join cleanly) plus interior ticks. The top rule sits
		// on the opposite side of the labels so the bracket "opens" toward them.
		const bracketPath = $.derived(() => {
			if (barWidth() <= 0) return '';

			const x0 = padding;
			const x1 = padding + barWidth();
			const yRule = labelPlacement === 'top' ? barY() + height : barY();
			const yTicks = labelPlacement === 'top' ? barY() : barY() + height;
			let d = `M${x0},${yTicks}L${x0},${yRule}L${x1},${yRule}L${x1},${yTicks}`;

			for (let i = 1; i < ticks; i++) {
				const tx = padding + barWidth() * i / ticks;

				d += `M${tx},${yRule}L${tx},${yTicks}`;
			}

			return d;
		});

		$$renderer.push(`<div${$.attributes(
			{
				...restProps,
				'data-placement': placement,
				class: $.clsx(cls('lc-geo-legend-container', className, classes.root))
			},
			'svelte-fxbnq7'
		)}>`);

		if (barWidth() > 0) {
			$$renderer.push(`<!--[0--><svg${$.attr('width', width())}${$.attr('height', svgHeight())}${$.attr('viewBox', `0 0 ${$.stringify(width())} ${$.stringify(svgHeight())}`)} class="lc-geo-legend-svg svelte-fxbnq7">`);

			if (title) {
				$$renderer.push(`<!--[0--><text${$.attr('x', padding)}${$.attr('y', titleFontSize)}${$.attr_class($.clsx(cls('lc-geo-legend-title', classes.title)), 'svelte-fxbnq7')}${$.attr_style('', { 'font-size': titleFontSize })}>${$.escape(title)}</text>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);

			if (variant === 'bracket') {
				$$renderer.push(`<!--[0--><path${$.attr('d', bracketPath())}${$.attr('stroke', color)} stroke-linecap="round" stroke-linejoin="round"${$.attr_class($.clsx(cls('lc-geo-legend-bar', classes.bar)), 'svelte-fxbnq7')}${$.attr_style('', { fill: 'none' })}></path>`);
			} else if (variant === 'alternating') {
				$$renderer.push(`<!--[1--><!--[-->`);

				const each_array = $.ensure_array_like(Array.from({ length: ticks }));

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _ = each_array[i];

					if (i % 2 === 0) {
						$$renderer.push('<!--[0-->');

						const x1 = padding + barWidth() * i / ticks;
						const x2 = padding + barWidth() * (i + 1) / ticks;

						$$renderer.push(`<rect${$.attr('x', x1)}${$.attr('y', barY())}${$.attr('width', x2 - x1)}${$.attr('height', height)}${$.attr('fill', color)}${$.attr_class($.clsx(cls('lc-geo-legend-bar', classes.bar)), 'svelte-fxbnq7')}></rect>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--><rect${$.attr('x', padding)}${$.attr('y', barY())}${$.attr('width', barWidth())}${$.attr('height', height)}${$.attr('stroke', color)}${$.attr_class($.clsx(cls('lc-geo-legend-bar', classes.bar)), 'svelte-fxbnq7')}${$.attr_style('', { fill: 'none' })}></rect>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><g class="lc-geo-legend-ticks"><!--[-->`);

			const each_array_1 = $.ensure_array_like(tickValues());

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let value = each_array_1[i];
				const x = padding + barWidth() * i / ticks;

				$$renderer.push(`<text${$.attr('x', x)}${$.attr('y', tickLabelY())} text-anchor="middle"${$.attr_class($.clsx(cls('lc-geo-legend-label', classes.label)), 'svelte-fxbnq7')}${$.attr_style('', { 'font-size': tickFontSize })}>${$.escape(formatTick(value))}</text>`);
			}

			$$renderer.push(`<!--]--></g></svg>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref: refProp });
	});
}