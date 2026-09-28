import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { getPointLabelLayout } from '$lib/utils/labelPlacement.js';
import { getPixelValue } from '../Text/Text.shared.svelte.js';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function AnnotationPoint_base($$anchor, $$props) {
	$.push($$props, true);

	let r = $.prop($$props, 'r', 3, 4),
		labelPlacement = $.prop($$props, 'labelPlacement', 3, 'center'),
		labelXOffset = $.prop($$props, 'labelXOffset', 3, 0),
		labelYOffset = $.prop($$props, 'labelYOffset', 3, 0),
		fontSize = $.prop($$props, 'fontSize', 3, 12),
		labelGap = $.prop($$props, 'labelGap', 3, 2);

	const ctx = getChartContext();
	const geo = getGeoContext();

	// Over a stack the point sits on its series' running total, not on the series' own value
	const stackedX = $.derived(() => ctx.valueAxis === 'x'
		? ctx.stackedValue($$props.seriesKey, $$props.y, $$props.x)
		: $$props.x);

	const stackedY = $.derived(() => ctx.valueAxis === 'y'
		? ctx.stackedValue($$props.seriesKey, $$props.x, $$props.y)
		: $$props.y);

	const point = $.derived(() => {
		if (geo.projection && typeof $$props.x === 'number' && typeof $$props.y === 'number') {
			const [px, py] = geo.projection([$$props.x, $$props.y]) ?? [0, 0];

			return { x: px, y: py };
		}

		return {
			x: $.get(stackedX)
				? ctx.xScale($.get(stackedX)) + (isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0)
				: 0,

			y: $.get(stackedY)
				? ctx.yScale($.get(stackedY)) + (isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0)
				: ctx.height
		};
	});

	// Where `smart`/discrete placement puts the label — shared with `getPointLabelRect`
	// consumers (e.g. occlusion) so the measured box matches the rendered label.
	const labelLayout = $.derived(() => getPointLabelLayout({
		x: $.get(point).x,
		y: $.get(point).y,
		r: r(),
		labelPlacement: labelPlacement(),
		labelX: $$props.labelX,
		labelY: $$props.labelY,
		labelXOffset: labelXOffset(),
		labelYOffset: labelYOffset(),
		fontSize: getPixelValue(fontSize()),
		labelGap: labelGap(),
		link: !!$$props.link,
		verticalAnchor: $$props.props?.label?.verticalAnchor
	}));

	// Render `<Text>` with the raw `fontSize` (it resolves em/etc. itself)
	const labelProps = $.derived(() => ({ ...$.get(labelLayout).text, fontSize: fontSize() }));

	// Leader `<Link>` endpoints. The target is the anchor; the source sits on the
	// ring — following the label for `smart`, but fixed to the placement direction
	// otherwise. Spacing to the text is handled by `labelGap` (which moves the
	// text, not the line).
	const linkEndpoints = $.derived(() => {
		if (!$$props.link) return null;

		const a = $.get(labelLayout).anchor;

		if (labelPlacement() === 'smart') {
			const dx = a.x - $.get(point).x;
			const dy = a.y - $.get(point).y;
			const dist = Math.hypot(dx, dy);

			if (dist <= r()) return null;

			return {
				source: {
					x: $.get(point).x + r() * dx / dist,
					y: $.get(point).y + r() * dy / dist
				},
				target: { x: a.x, y: a.y }
			};
		}

		const { x: dirX, y: dirY } = $.get(labelLayout).direction;

		if (dirX === 0 && dirY === 0) return null; // labelPlacement='center' — no line

		const mag = Math.hypot(dirX, dirY);

		return {
			source: {
				x: $.get(point).x + r() * dirX / mag,
				y: $.get(point).y + r() * dirY / mag
			},
			target: { x: a.x, y: a.y }
		};
	});

	const linkProps = $.derived(() => typeof $$props.link === 'object' ? $$props.link : {});

	function onPointerMove(e) {
		if ($$props.details) {
			e.stopPropagation();

			ctx.tooltip.show(e, {
				annotation: { label: $$props.label, details: $$props.details }
			});
		}
	}

	function onPointerLeave(e) {
		if ($$props.details) {
			e.stopPropagation();
			ctx.tooltip.hide();
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cls('lc-annotation-point', $$props.link && 'lc-annotation-point-ring', $$props.props?.circle?.class));

		$.component(node, () => $$props.Circle, ($$anchor, Circle_1) => {
			Circle_1($$anchor, $.spread_props(
				{
					get cx() {
						return $.get(point).x;
					},

					get cy() {
						return $.get(point).y;
					},

					get r() {
						return r();
					},
					onpointermove: onPointerMove,
					onmousemove: onPointerMove,
					ontouchmove: onPointerMove,
					onpointerleave: onPointerLeave,
					onmouseleave: onPointerLeave,
					ontouchend: onPointerLeave
				},
				() => $$props.props?.circle,
				{
					get class() {
						return $.get($0);
					}
				}
			));
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cls('lc-annotation-point-link', typeof $.get(linkProps).class === 'string' ? $.get(linkProps).class : undefined));

				$.component(node_2, () => $$props.Link, ($$anchor, Link_1) => {
					Link_1($$anchor, $.spread_props(
						{
							get x1() {
								return $.get(linkEndpoints).source.x;
							},

							get y1() {
								return $.get(linkEndpoints).source.y;
							},

							get x2() {
								return $.get(linkEndpoints).target.x;
							},

							get y2() {
								return $.get(linkEndpoints).target.y;
							},
							type: 'straight'
						},
						() => $.get(linkProps),
						{
							get class() {
								return $.get($0);
							}
						}
					));
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(linkEndpoints) && $$props.Link) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => cls('lc-annotation-point-label', $$props.props?.label?.class));

				$.component(node_4, () => $$props.Text, ($$anchor, Text_1) => {
					Text_1($$anchor, $.spread_props(
						{
							get value() {
								return $$props.label;
							}
						},
						() => $.get(labelProps),
						() => $$props.props?.label,
						{
							get class() {
								return $.get($0);
							}
						}
					));
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node_3, ($$render) => {
			if ($$props.label) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}