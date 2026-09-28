import * as $ from 'svelte/internal/server';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { getChartContext } from '$lib/contexts/chart.js';
import { asAny } from '$lib/utils/types.js';

export default function CircleLegend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			scale: scaleProp,
			title = '',
			ticks = 4,
			tickValues: tickValuesProp,
			tickFormat: tickFormatProp,
			tickFontSize = 10,
			titleFontSize = 10,
			labelWidth = 40,
			labelGap = 4,
			labelPlacement = 'right',
			placement,
			fill = 'none',
			stroke = 'currentColor',
			strokeWidth = 1,
			value: valueProp,
			classes = {},
			ref: refProp = void 0,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		const ctx = getChartContext();
		const scale = $.derived(() => scaleProp ?? ctx.rScale);

		const tickValues = $.derived(() => {
			if (tickValuesProp) return tickValuesProp;
			if (!scale()) return [];

			// Prefer scale.ticks (continuous scales) and pick the largest `ticks` positive values
			if (typeof scale().ticks === 'function') {
				const all = scale().ticks(ticks).filter((v) => Number(scale()(v)) > 0);

				if (all.length >= 2) {
					return all.slice(-ticks);
				}
			}

			// Fallback: derive evenly spaced values from the domain extent
			const domain = scale().domain();

			const min = Number(domain[0]);
			const max = Number(domain[domain.length - 1]);
			const n = Math.max(2, ticks);

			return Array.from({ length: n }, (_, i) => min + (max - min) * (i + 1) / n);
		});

		const items = $.derived(() => {
			if (!scale()) return [];

			return tickValues().map((value) => ({ value, radius: Number(scale()(value)) })).filter((d) => Number.isFinite(d.radius) && d.radius > 0).sort((a, b) => b.radius - a.radius);
		});

		const maxRadius = $.derived(() => items()[0]?.radius ?? 0);

		// Indicator for the currently hovered value. If `value` is explicitly
		// provided, use it; otherwise fall back to `ctx.tooltip.data` piped through
		// the chart's radius accessor (`ctx.r`).
		const indicatorRadius = $.derived(() => {
			if (!scale()) return null;

			let value = valueProp;

			if (value == null) {
				const data = ctx.tooltip?.data;

				if (data == null) return null;

				value = ctx.r?.(data);
			}

			if (value == null) return null;

			const r = Number(scale()(value));

			if (!Number.isFinite(r) || r <= 0) return null;

			return r;
		});

		const padding = $.derived(() => Math.ceil(strokeWidth / 2));
		const titleHeight = $.derived(() => title ? titleFontSize + 6 : 0);

		const width = $.derived(() => labelPlacement === 'inline'
			? maxRadius() * 2 + padding() * 2
			: maxRadius() * 2 + padding() * 2 + labelGap + labelWidth);

		const svgHeight = $.derived(() => maxRadius() * 2 + padding() * 2 + titleHeight());

		const cx = $.derived(() => labelPlacement === 'left'
			? labelWidth + labelGap + maxRadius() + padding()
			: maxRadius() + padding());

		const baseY = $.derived(() => maxRadius() * 2 + padding() + titleHeight());

		// Leader line / label x positions (only used for left/right placement)
		const labelLineX = $.derived(() => labelPlacement === 'left'
			? cx() - maxRadius() - labelGap
			: cx() + maxRadius() + labelGap);

		const labelTextX = $.derived(() => labelPlacement === 'inline'
			? cx()
			: labelPlacement === 'left' ? labelLineX() - 2 : labelLineX() + 2);

		const labelTextAnchor = $.derived(() => labelPlacement === 'inline'
			? 'middle'
			: labelPlacement === 'left' ? 'end' : 'start');

		$$renderer.push(`<div${$.attributes(
			{
				...restProps,
				'data-placement': placement,
				class: $.clsx(cls('lc-circle-legend-container', className, classes.root))
			},
			'svelte-1hlnf2p'
		)}>`);

		if (items().length) {
			$$renderer.push(`<!--[0--><svg${$.attr('width', width())}${$.attr('height', svgHeight())}${$.attr('viewBox', `0 0 ${$.stringify(width())} ${$.stringify(svgHeight())}`)} class="lc-circle-legend-svg svelte-1hlnf2p">`);

			if (title) {
				$$renderer.push(`<!--[0--><text${$.attr('x', cx())}${$.attr('y', titleFontSize)} text-anchor="middle"${$.attr_class($.clsx(cls('lc-circle-legend-title', classes.title)), 'svelte-1hlnf2p')}${$.attr_style('', { 'font-size': titleFontSize })}>${$.escape(title)}</text>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><g class="lc-circle-legend-g">`);

			if (indicatorRadius() != null) {
				$$renderer.push(`<!--[0--><circle${$.attr('cx', cx())}${$.attr('cy', baseY() - indicatorRadius())}${$.attr('r', indicatorRadius())}${$.attr('fill', stroke)} fill-opacity="0.5"${$.attr_class($.clsx(cls('lc-circle-legend-indicator')), 'svelte-1hlnf2p')}></circle>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><!--[-->`);

			const each_array = $.ensure_array_like(items());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<circle${$.attr('cx', cx())}${$.attr('cy', baseY() - item.radius)}${$.attr('r', item.radius)}${$.attr('fill', fill)}${$.attr('stroke', stroke)}${$.attr('stroke-width', strokeWidth)}${$.attr_class($.clsx(cls('lc-circle-legend-circle', classes.circle)), 'svelte-1hlnf2p')}></circle>`);

				if (labelPlacement !== 'inline') {
					$$renderer.push(`<!--[0--><line${$.attr('x1', cx())}${$.attr('y1', baseY() - item.radius * 2)}${$.attr('x2', labelLineX())}${$.attr('y2', baseY() - item.radius * 2)}${$.attr('stroke', stroke)} stroke-dasharray="2,2"${$.attr_class($.clsx(cls('lc-circle-legend-tick', classes.tick)), 'svelte-1hlnf2p')}></line>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--><text${$.attr('x', labelTextX())}${$.attr('y', labelPlacement === 'inline'
					? baseY() - item.radius * 2 + tickFontSize
					: baseY() - item.radius * 2)}${$.attr('text-anchor', labelTextAnchor())}${$.attr('dominant-baseline', labelPlacement === 'inline' ? 'auto' : 'middle')}${$.attr_class($.clsx(cls('lc-circle-legend-label', classes.label)), 'svelte-1hlnf2p')}${$.attr_style('', { 'font-size': tickFontSize })}>${$.escape(tickFormatProp
					? format(item.value, asAny(tickFormatProp))
					: item.value)}</text>`);
			}

			$$renderer.push(`<!--]--></g></svg>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref: refProp });
	});
}