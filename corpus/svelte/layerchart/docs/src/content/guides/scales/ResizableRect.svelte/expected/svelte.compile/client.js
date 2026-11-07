import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Rect, Text } from 'layerchart';
import { movable } from '$lib/attachments/movable';
import { scaleLinear } from 'd3-scale';
import LucideGripVertical from '~icons/lucide/grip-vertical';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ResizableRect($$anchor, $$props) {
	$.push($$props, true);

	const rectHeight = 64;
	const handleWidth = 16;

	let bounds = $.prop($$props, 'bounds', 15),
		value = $.prop($$props, 'value', 15, 0),
		isHovering = $.prop($$props, 'isHovering', 15, false);

	let midBounds = $.derived(() => Math.round(bounds()[0] + (bounds()[1] - bounds()[0]) / 2));

	// Map rect width to bounds values
	let boundsScale = $.derived(() => scaleLinear().domain([
		0,
		$$props.context
			? $$props.context.xScale(bounds()[1]) - $$props.context.xScale(bounds()[0])
			: 0
	]).range(bounds()));

	function handlePointerMove(e, isRightHandle = false) {
		let offsetValue;

		if (isRightHandle) {
			const rectWidth = $$props.context.xScale(bounds()[1]) - $$props.context.xScale(bounds()[0]);

			offsetValue = Math.round($.get(boundsScale)(rectWidth - handleWidth + e.offsetX));
		} else {
			offsetValue = Math.round($.get(boundsScale)(e.offsetX));
		}

		value(offsetValue);
		$$props.onValueChange?.(offsetValue);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $$props.context.xScale(bounds()[0]));
		let $1 = $.derived(() => $$props.context.xScale(bounds()[1]) - $$props.context.xScale(bounds()[0]));

		Rect(node, {
			get x() {
				return $.get($0);
			},

			get y() {
				return $$props.y;
			},

			get width() {
				return $.get($1);
			},
			height: rectHeight,
			class: 'bg-primary/10 border-2 border-primary/70 rounded-lg grid items-center',
			onpointerenter: () => {
				isHovering(true);
			},

			onpointerleave: () => {
				isHovering(false);
			},
			onpointermove: (e) => handlePointerMove(e)
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $$props.context.xScale(bounds()[0]));

		Rect(node_1, {
			get x() {
				return $.get($0);
			},

			get y() {
				return $$props.y;
			},
			width: handleWidth,
			height: rectHeight,
			class: 'bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pl-0.5 rounded-l-lg',
			onpointerenter: () => {
				isHovering(true);
			},

			onpointerleave: () => {
				isHovering(false);
			},
			onpointermove: (e) => handlePointerMove(e),
			[$.attachment()]: ($$node) => (movable({
				onMove: ({ dx }) => {
					// @ts-expect-error
					const newLow = $$props.context.xScale.invert($$props.context.xScale(bounds()[0]) + dx);

					if (newLow >= 0 && newLow < bounds()[1]) {
						bounds([Math.round(newLow), bounds()[1]]);
					}
				}
			}) || $.noop)($$node),

			children: ($$anchor, $$slotProps) => {
				LucideGripVertical($$anchor, { class: 'text-primary/50' });
			},
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $$props.context.xScale(bounds()[1]) - handleWidth);

		Rect(node_2, {
			get x() {
				return $.get($0);
			},

			get y() {
				return $$props.y;
			},
			width: handleWidth,
			height: rectHeight,
			class: 'bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pr-0.5 rounded-r-lg',
			onpointerenter: () => {
				isHovering(true);
			},

			onpointerleave: () => {
				isHovering(false);
			},
			onpointermove: (e) => handlePointerMove(e, true),
			[$.attachment()]: ($$node) => (movable({
				onMove: ({ dx }) => {
					// @ts-expect-error
					const newHigh = $$props.context.xScale.invert($$props.context.xScale(bounds()[1]) + dx);

					if (newHigh <= $$props.chartDomain[1] && newHigh > bounds()[0]) {
						bounds([bounds()[0], Math.round(newHigh)]);
					}
				}
			}) || $.noop)($$node),

			children: ($$anchor, $$slotProps) => {
				LucideGripVertical($$anchor, { class: 'text-primary/50' });
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => $$props.context.xScale(bounds()[0]));
		let $1 = $.derived(() => $$props.y + rectHeight / 2);

		Text(node_3, {
			get value() {
				return bounds()[0];
			},

			get x() {
				return $.get($0);
			},
			dx: handleWidth + 2,
			get y() {
				return $.get($1);
			},
			textAnchor: 'start',
			verticalAnchor: 'middle',
			class: 'text-sm text-primary pointer-events-none pl-[2px]'
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => $$props.context.xScale($.get(midBounds)));
		let $1 = $.derived(() => $$props.y + rectHeight / 2);

		Text(node_4, {
			get value() {
				return $$props.label;
			},

			get x() {
				return $.get($0);
			},

			get y() {
				return $.get($1);
			},
			textAnchor: 'middle',
			verticalAnchor: 'middle',
			class: 'text-primary font-semibold pointer-events-none'
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => $$props.context.xScale(value()));
		let $1 = $.derived(() => $$props.y + ($$props.label === 'Domain' ? rectHeight : 0));
		let $2 = $.derived(() => $$props.label === 'Domain' ? -3 : 3);
		let $3 = $.derived(() => $$props.label === 'Domain' ? 'end' : 'start');

		Text(node_5, {
			get value() {
				return value();
			},

			get x() {
				return $.get($0);
			},

			get y() {
				return $.get($1);
			},

			get dy() {
				return $.get($2);
			},
			textAnchor: 'middle',
			get verticalAnchor() {
				return $.get($3);
			},
			class: 'text-sm text-white bg-primary rounded-full px-2 font-medium pointer-events-none'
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(() => $$props.context.xScale(bounds()[1]));
		let $1 = $.derived(() => $$props.y + rectHeight / 2);

		Text(node_6, {
			get value() {
				return bounds()[1];
			},

			get x() {
				return $.get($0);
			},
			dx: -handleWidth - 2,
			get y() {
				return $.get($1);
			},
			textAnchor: 'end',
			verticalAnchor: 'middle',
			class: 'text-sm text-primary pointer-events-none pr-[2px]'
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}