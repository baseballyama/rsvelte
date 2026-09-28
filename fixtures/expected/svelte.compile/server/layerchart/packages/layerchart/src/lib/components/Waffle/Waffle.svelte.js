import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import Group from '../Group/Group.svelte';
import Path from '../Path/Path.svelte';
import Pattern from '../Pattern/Pattern.svelte';
import { WaffleState } from './Waffle.shared.svelte.js';

export default function Waffle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			data: dataProp,
			x: xProp,
			y: yProp,
			x1: x1Prop,
			y1: y1Prop,
			axis,
			unit,
			multiple,
			gap,
			round,
			rx,
			ry,
			seriesKey,
			insets,
			width,
			height,
			key = (_, i) => i,
			fill,
			fillOpacity,
			stroke,
			strokeWidth,
			opacity,
			class: className,
			tooltip,
			onWaffleClick,
			onpointerenter,
			onpointermove,
			onpointerleave,
			onclick,
			symbol,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new WaffleState(() => ({
			data: dataProp,
			x: xProp,
			y: yProp,
			x1: x1Prop,
			y1: y1Prop,
			axis,
			unit,
			multiple,
			gap,
			round,
			rx,
			ry,
			seriesKey,
			insets,
			width,
			height,
			fill
		}));

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(c.items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			const onItemEnter = (e) => {
				onpointerenter?.(e);

				if (tooltip) c.ctx.tooltip.show(e, item.data);
			};

			const onItemMove = (e) => {
				onpointermove?.(e);

				if (tooltip) c.ctx.tooltip.show(e, item.data);
			};

			const onItemLeave = (e) => {
				onpointerleave?.(e);

				if (tooltip) c.ctx.tooltip.hide();
			};

			const onItemClick = (e) => {
				onclick?.(e);
				onWaffleClick?.(e, { data: item.data });
			};

			const cellInset = c.gap / 2;
			const innerWidth = Math.max(0, item.cx - 2 * cellInset);
			const innerHeight = Math.max(0, item.cy - 2 * cellInset);
			const color = item.fill ?? (typeof fill === 'string' ? fill : undefined) ?? 'currentColor';

			function symbolPatternContent($$renderer) {
				$$renderer.push(`<g${$.attr('transform', `translate(${cellInset},${cellInset})`)}${$.attr('color', color)}>`);

				symbol?.($$renderer, {
					width: innerWidth,
					height: innerHeight,
					datum: item.data,
					color
				});

				$$renderer.push(`<!----></g>`);
			}

			Group($$renderer, {
				x: item.tx,
				y: item.ty,
				class: cls('lc-waffle', className),
				opacity: (opacity ?? 1) * c.seriesOpacity,
				children: ($$renderer) => {
					{
						function children($$renderer, { pattern }) {
							Path($$renderer, $.spread_props([
								{
									pathData: item.pathData,
									fill: pattern,
									stroke,
									strokeWidth,
									class: 'lc-waffle-cell',
									onpointerenter: onItemEnter,
									onpointermove: onItemMove,
									onpointerleave: onItemLeave,
									onclick: onItemClick
								},
								rest
							]));
						}

						Pattern($$renderer, {
							width: item.cx,
							height: item.cy,
							rects: [
								{
									inset: cellInset,
									color: item.fill ?? (typeof fill === 'string' ? fill : undefined),
									opacity: fillOpacity,
									rx,
									ry
								}
							],
							patternContent: symbol ? symbolPatternContent : undefined,
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}