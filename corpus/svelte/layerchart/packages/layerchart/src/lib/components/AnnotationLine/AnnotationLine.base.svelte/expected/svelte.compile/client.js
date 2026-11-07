import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<!> <!>`, 1);

export default function AnnotationLine_base($$anchor, $$props) {
	$.push($$props, true);

	let labelPlacement = $.prop($$props, 'labelPlacement', 3, 'top-right'),
		labelXOffset = $.prop($$props, 'labelXOffset', 3, 0),
		labelYOffset = $.prop($$props, 'labelYOffset', 3, 0);

	const ctx = getChartContext();
	const isVertical = $.derived(() => $$props.x != null || $$props.x1 != null && $$props.x2 != null && $$props.x1 === $$props.x2);

	/**
	 * Each end read against its series' stacked segment, at the category that end sits on.
	 *
	 * A rule spanning the plot (a `y` with no `x`) has no single category to read against, so it
	 * is left where it was asked for.
	 */
	const stacked = $.derived(() => {
		if ($$props.seriesKey == null || !ctx.isStacked) return {
			x1: $$props.x1,
			y1: $$props.y1,
			x2: $$props.x2,
			y2: $$props.y2,
			x: $$props.x,
			y: $$props.y
		}; // prettier-ignore

		const at = (value, keyValue) => keyValue == null
			? value
			: ctx.stackedValue($$props.seriesKey, keyValue, value);

		return ctx.valueAxis === 'y'
			? {
				x1: $$props.x1,
				x2: $$props.x2,
				x: $$props.x,
				y1: at($$props.y1, $$props.x1 ?? $$props.x),
				y2: at($$props.y2, $$props.x2 ?? $$props.x),
				y: at($$props.y, $$props.x)
			}
			: // prettier-ignore
			{
				y1: $$props.y1,
				y2: $$props.y2,
				y: $$props.y,
				x1: at($$props.x1, $$props.y1 ?? $$props.y),
				x2: at($$props.x2, $$props.y2 ?? $$props.y),
				x: at($$props.x, $$props.y)
			}; // prettier-ignore
	});

	const line = $.derived(() => ({
		x1: $.get(stacked // prettier-ignore
		).x1 != null
			? ctx.xScale($.get(stacked).x1)
			: $.get(stacked).x != null ? ctx.xScale($.get(stacked).x) : ctx.xRange[0],

		y1: $.get(stacked).y1 != null
			? ctx.yScale($.get(stacked).y1)
			: $.get(stacked).y != null && $.get(stacked).x == null ? ctx.yScale($.get(stacked).y) : ctx.yRange[0],

		x2: $.get(stacked // prettier-ignore
		).x2 != null
			? ctx.xScale($.get(stacked).x2)
			: $.get(stacked).x != null ? ctx.xScale($.get(stacked).x) : ctx.xRange[1],

		y2: $.get(stacked // prettier-ignore
		).y2 != null
			? ctx.yScale($.get(stacked).y2)
			: $.get(stacked).y != null ? ctx.yScale($.get(stacked).y) : ctx.yRange[1]
	}));

	const isSloped = $.derived(() => !$.get(isVertical) && $.get(line).x1 !== $.get(line).x2 && $.get(line).y1 !== $.get(line).y2);

	const slopeAngle = $.derived(() => {
		let angle = Math.atan2($.get(line).y2 - $.get(line).y1, $.get(line).x2 - $.get(line).x1) * (180 / Math.PI);

		if (angle > 90) angle -= 180; else if (angle < -90) angle += 180;

		return angle;
	});

	const labelProps = $.derived(() => {
		const isLeft = labelPlacement().includes('left');
		const isRight = labelPlacement().includes('right');
		const isTop = labelPlacement().includes('top');
		const isBottom = labelPlacement().includes('bottom');

		if ($.get(isVertical)) {
			return {
				x: $.get(line).x1 + (isLeft ? -labelXOffset() : labelXOffset()),
				y: (isTop
					? $.get(line).y2
					: isBottom
						? $.get(line).y1
						: ($.get(line).y1 - $.get(line).y2) / 2) + (['top', 'bottom-left', 'bottom-right'].includes(labelPlacement()) ? -labelYOffset() : labelYOffset()),
				dy: -2,
				textAnchor: isLeft ? 'end' : isRight ? 'start' : 'middle',
				verticalAnchor: labelPlacement() === 'top'
					? 'end'
					: labelPlacement() === 'bottom'
						? 'start'
						: isTop ? 'start' : isBottom ? 'end' : 'middle'
			};
		}

		const _x = isLeft
			? $.get(line).x1
			: isRight
				? $.get(line).x2
				: ($.get(line).x1 + $.get(line).x2) / 2;

		const _y = isLeft
			? $.get(line).y1
			: isRight
				? $.get(line).y2
				: ($.get(line).y1 + $.get(line).y2) / 2;

		const textAnchor = labelPlacement() === 'left'
			? 'end'
			: labelPlacement() === 'right'
				? 'start'
				: isLeft ? 'start' : isRight ? 'end' : 'middle';

		const verticalAnchor = isTop ? 'end' : isBottom ? 'start' : 'middle';

		if ($.get(isSloped)) {
			const aSign = ['left', 'top-right', 'bottom-right'].includes(labelPlacement()) ? -1 : 1;
			const pSign = isTop ? 1 : -1;
			const alongLine = aSign * labelXOffset();
			const perpAbove = pSign * labelYOffset() + 2;
			const theta = $.get(slopeAngle) * Math.PI / 180;
			const cosT = Math.cos(theta);
			const sinT = Math.sin(theta);

			return {
				x: _x,
				y: _y,
				rotate: $.get(slopeAngle),
				dx: alongLine * cosT + perpAbove * sinT,
				dy: alongLine * sinT - perpAbove * cosT,
				textAnchor,
				verticalAnchor
			};
		}

		return {
			x: _x + (['left', 'top-right', 'bottom-right'].includes(labelPlacement()) ? -labelXOffset() : labelXOffset()),
			y: _y + (isTop ? -labelYOffset() : labelYOffset()),
			dy: -2,
			textAnchor,
			verticalAnchor
		};
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cls('lc-annotation-line', $$props.props?.line?.class));

		$.component(node, () => $$props.Line, ($$anchor, Line_1) => {
			Line_1($$anchor, $.spread_props(
				{
					get x1() {
						return $.get(line).x1;
					},

					get y1() {
						return $.get(line).y1;
					},

					get x2() {
						return $.get(line).x2;
					},

					get y2() {
						return $.get(line).y2;
					}
				},
				() => $$props.props?.line,
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
				let $0 = $.derived(() => cls('lc-annotation-line-label', $$props.props?.label?.class));

				$.component(node_2, () => $$props.Text, ($$anchor, Text_1) => {
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

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.label) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}