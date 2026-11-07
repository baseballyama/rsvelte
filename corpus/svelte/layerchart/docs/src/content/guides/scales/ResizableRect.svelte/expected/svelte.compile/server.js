import * as $ from 'svelte/internal/server';
import { Rect, Text } from 'layerchart';
import { movable } from '$lib/attachments/movable';
import { scaleLinear } from 'd3-scale';
import LucideGripVertical from '~icons/lucide/grip-vertical';

export default function ResizableRect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rectHeight = 64;
		const handleWidth = 16;

		let {
			context,
			bounds = void 0,
			value = 0,
			label,
			y,
			chartDomain,
			isHovering = false,
			onValueChange
		} = $$props;

		let midBounds = $.derived(() => Math.round(bounds[0] + (bounds[1] - bounds[0]) / 2));

		// Map rect width to bounds values
		let boundsScale = $.derived(() => scaleLinear().domain([
			0,
			context
				? context.xScale(bounds[1]) - context.xScale(bounds[0])
				: 0
		]).range(bounds));

		function handlePointerMove(e, isRightHandle = false) {
			let offsetValue;

			if (isRightHandle) {
				const rectWidth = context.xScale(bounds[1]) - context.xScale(bounds[0]);

				offsetValue = Math.round(boundsScale()(rectWidth - handleWidth + e.offsetX));
			} else {
				offsetValue = Math.round(boundsScale()(e.offsetX));
			}

			value = offsetValue;
			onValueChange?.(offsetValue);
		}

		Rect($$renderer, {
			x: context.xScale(bounds[0]),
			y,
			width: context.xScale(bounds[1]) - context.xScale(bounds[0]),
			height: rectHeight,
			class: 'bg-primary/10 border-2 border-primary/70 rounded-lg grid items-center',
			onpointerenter: () => {
				isHovering = true;
			},

			onpointerleave: () => {
				isHovering = false;
			},
			onpointermove: (e) => handlePointerMove(e)
		});

		$$renderer.push(`<!----> `);

		Rect($$renderer, {
			x: context.xScale(bounds[0]),
			y,
			width: handleWidth,
			height: rectHeight,
			class: 'bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pl-0.5 rounded-l-lg',
			onpointerenter: () => {
				isHovering = true;
			},

			onpointerleave: () => {
				isHovering = false;
			},
			onpointermove: (e) => handlePointerMove(e),
			children: ($$renderer) => {
				LucideGripVertical($$renderer, { class: 'text-primary/50' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Rect($$renderer, {
			x: context.xScale(bounds[1]) - handleWidth,
			y,
			width: handleWidth,
			height: rectHeight,
			class: 'bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pr-0.5 rounded-r-lg',
			onpointerenter: () => {
				isHovering = true;
			},

			onpointerleave: () => {
				isHovering = false;
			},
			onpointermove: (e) => handlePointerMove(e, true),
			children: ($$renderer) => {
				LucideGripVertical($$renderer, { class: 'text-primary/50' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			value: bounds[0],
			x: context.xScale(bounds[0]),
			dx: handleWidth + 2,
			y: y + rectHeight / 2,
			textAnchor: 'start',
			verticalAnchor: 'middle',
			class: 'text-sm text-primary pointer-events-none pl-[2px]'
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			value: label,
			x: context.xScale(midBounds()),
			y: y + rectHeight / 2,
			textAnchor: 'middle',
			verticalAnchor: 'middle',
			class: 'text-primary font-semibold pointer-events-none'
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			value,
			x: context.xScale(value),
			y: y + (label === 'Domain' ? rectHeight : 0),
			dy: label === 'Domain' ? -3 : 3,
			textAnchor: 'middle',
			verticalAnchor: label === 'Domain' ? 'end' : 'start',
			class: 'text-sm text-white bg-primary rounded-full px-2 font-medium pointer-events-none'
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			value: bounds[1],
			x: context.xScale(bounds[1]),
			dx: -handleWidth - 2,
			y: y + rectHeight / 2,
			textAnchor: 'end',
			verticalAnchor: 'middle',
			class: 'text-sm text-primary pointer-events-none pr-[2px]'
		});

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { bounds, value, isHovering });
	});
}