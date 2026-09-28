import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import Group from '../Group/Group.svelte';
import Path from '../Path/Path.svelte';
import Pattern from '../Pattern/Pattern.svelte';
import { WaffleState } from './Waffle.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'data',
	'x',
	'y',
	'x1',
	'y1',
	'axis',
	'unit',
	'multiple',
	'gap',
	'round',
	'rx',
	'ry',
	'seriesKey',
	'insets',
	'width',
	'height',
	'key',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeWidth',
	'opacity',
	'class',
	'tooltip',
	'onWaffleClick',
	'onpointerenter',
	'onpointermove',
	'onpointerleave',
	'onclick',
	'symbol'
]);

var root = $.from_svg(`<g><!></g>`);

export default function Waffle($$anchor, $$props) {
	$.push($$props, true);

	let key = $.prop($$props, 'key', 3, (_, i) => i),
		rest = $.rest_props($$props, rest_excludes);

	const c = new WaffleState(() => ({
		data: $$props.data,
		x: $$props.x,
		y: $$props.y,
		x1: $$props.x1,
		y1: $$props.y1,
		axis: $$props.axis,
		unit: $$props.unit,
		multiple: $$props.multiple,
		gap: $$props.gap,
		round: $$props.round,
		rx: $$props.rx,
		ry: $$props.ry,
		seriesKey: $$props.seriesKey,
		insets: $$props.insets,
		width: $$props.width,
		height: $$props.height,
		fill: $$props.fill
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => c.items, (item) => key()(item.data, item.index), ($$anchor, item) => {
		const symbolPatternContent = ($$anchor) => {
			var g = root();
			var node_1 = $.child(g);

			$.snippet(node_1, () => $$props.symbol ?? $.noop, () => ({
				width: $.get(innerWidth),
				height: $.get(innerHeight),
				datum: $.get(item).data,
				color: $.get(color)
			}));

			$.reset(g);

			$.template_effect(() => {
				$.set_attribute(g, 'transform', `translate(${$.get(cellInset)},${$.get(cellInset)})`);
				$.set_attribute(g, 'color', $.get(color));
			});

			$.append($$anchor, g);
		};

		const onItemEnter = $.derived(() => (e) => {
			$$props.onpointerenter?.(e);

			if ($$props.tooltip) c.ctx.tooltip.show(e, $.get(item).data);
		});

		const onItemMove = $.derived(() => (e) => {
			$$props.onpointermove?.(e);

			if ($$props.tooltip) c.ctx.tooltip.show(e, $.get(item).data);
		});

		const onItemLeave = $.derived(() => (e) => {
			$$props.onpointerleave?.(e);

			if ($$props.tooltip) c.ctx.tooltip.hide();
		});

		const onItemClick = $.derived(() => (e) => {
			$$props.onclick?.(e);
			$$props.onWaffleClick?.(e, { data: $.get(item).data });
		});

		const cellInset = $.derived(() => c.gap / 2);
		const innerWidth = $.derived(() => Math.max(0, $.get(item).cx - 2 * $.get(cellInset)));
		const innerHeight = $.derived(() => Math.max(0, $.get(item).cy - 2 * $.get(cellInset)));
		const color = $.derived(() => $.get(item).fill ?? (typeof $$props.fill === 'string' ? $$props.fill : undefined) ?? 'currentColor');

		{
			let $0 = $.derived(() => cls('lc-waffle', $$props.class));
			let $1 = $.derived(() => ($$props.opacity ?? 1) * c.seriesOpacity);

			Group($$anchor, {
				get x() {
					return $.get(item).tx;
				},

				get y() {
					return $.get(item).ty;
				},

				get class() {
					return $.get($0);
				},

				get opacity() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							Path($$anchor, $.spread_props(
								{
									get pathData() {
										return $.get(item).pathData;
									},

									get fill() {
										return pattern();
									},

									get stroke() {
										return $$props.stroke;
									},

									get strokeWidth() {
										return $$props.strokeWidth;
									},
									class: 'lc-waffle-cell',
									onpointerenter: $.get(onItemEnter),
									onpointermove: $.get(onItemMove),
									onpointerleave: $.get(onItemLeave),
									onclick: $.get(onItemClick)
								},
								() => rest
							));
						};

						let $0 = $.derived(() => [
							{
								inset: $.get(cellInset),
								color: $.get(item).fill ?? (typeof $$props.fill === 'string' ? $$props.fill : undefined),
								opacity: $$props.fillOpacity,
								rx: $$props.rx,
								ry: $$props.ry
							}
						]);

						let $1 = $.derived(() => $$props.symbol ? symbolPatternContent : undefined);

						Pattern($$anchor, {
							get width() {
								return $.get(item).cx;
							},

							get height() {
								return $.get(item).cy;
							},

							get rects() {
								return $.get($0);
							},

							get patternContent() {
								return $.get($1);
							},
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}