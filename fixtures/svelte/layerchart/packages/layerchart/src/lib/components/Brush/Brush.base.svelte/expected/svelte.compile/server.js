import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { getChartContext } from '$lib/contexts/chart.js';
import { BrushState as BrushStateClass } from '$lib/states/brush.svelte.js';
import { brushGesture } from '$lib/attachments/brushable.js';

export default function Brush_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Rect,
			// Aliased so `$state` in this file isn't read as a store subscription of the prop
			state: stateProp = void 0,
			axis = 'x',
			x = 0,
			y = 0,
			width,
			height,
			handleSize = 8,
			onChange,
			classes = {}
		} = $$props;

		const ctx = getChartContext();

		/** The region element, which every part measures against — a handle is only a few pixels wide */
		let regionEl = void 0;

		function bounds(node) {
			if (regionEl) return regionEl.getBoundingClientRect();

			// Canvas draws its marks, so the node is the layer's own canvas — the region starts inside it
			const rect = node.getBoundingClientRect();

			return {
				left: rect.left + (ctx.padding.left ?? 0) + x,
				top: rect.top + (ctx.padding.top ?? 0) + y
			};
		}

		// Take the selection given, or own one — either way `bind:state` reads it back
		const brushState = stateProp ?? new BrushStateClass(ctx, { axis });

		stateProp = brushState;

		const region = $.derived(() => ({
			x,
			y,
			width: width ?? ctx.width,
			height: height ?? ctx.height
		}));

		/**
		 * The selection, drawn within the region.
		 *
		 * `BrushState.range` spans the whole plot on an unbrushed axis, which is right for a chart-wide
		 * brush but not for one placed in a band of its own.
		 */
		const selection = $.derived(() => ({
			x: brushState.axis === 'y' ? region().x : brushState.range.x,
			width: brushState.axis === 'y' ? region().width : brushState.range.width,
			y: brushState.axis === 'x' ? region().y : brushState.range.y,
			height: brushState.axis === 'x' ? region().height : brushState.range.height
		}));

		/** The handles this brush carries, each driving its own edge */
		const handles = $.derived(() => [
			{ edge: 'top', cursor: 'cursor-ns-resize', axis: 'y' },
			{ edge: 'bottom', cursor: 'cursor-ns-resize', axis: 'y' },
			{ edge: 'left', cursor: 'cursor-ew-resize', axis: 'x' },
			{ edge: 'right', cursor: 'cursor-ew-resize', axis: 'x' }
		].filter((h) => brushState.axis === 'both' || brushState.axis === h.axis));

		/**
		 * The props that make one part of the brush take a drag.
		 *
		 * A handler rather than the `brushable` attachment, since a canvas layer draws its marks rather
		 * than creating elements for them — it hit-tests the pointer and calls what the mark registered.
		 */
		function part(mode) {
			return {
				onpointerdown: brushGesture({
					state: brushState,
					mode,
					bounds,
					// Wrapped rather than passed, so a changed `onChange` prop is still picked up
					onChange: (detail) => onChange?.(detail)
				})
			};
		}

		const parts = {
			root: part(),
			move: part('move'),
			top: part('top'),
			bottom: part('bottom'),
			left: part('left'),
			right: part('right')
		};

		/**
		 * Clearing from the selection itself, as `BrushContext` does — a selection covering most of its
		 * region leaves little of it left to click, which a brush in a narrow band hits easily.
		 */
		function clear() {
			brushState.reset();
			onChange?.({ state: brushState, phase: 'end' });
		}

		function handleRect(edge) {
			const { x: sx, y: sy, width: sw, height: sh } = selection();

			switch (edge) {
				case 'top':
					return { x: sx, y: sy - handleSize / 2, width: sw, height: handleSize };

				case 'bottom':
					return {
						x: sx,
						y: sy + sh - handleSize / 2,
						width: sw,
						height: handleSize
					};

				case 'left':
					return { x: sx - handleSize / 2, y: sy, width: handleSize, height: sh };

				case 'right':
					return {
						x: sx + sw - handleSize / 2,
						y: sy,
						width: handleSize,
						height: sh
					};
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Rect) {
				$$renderer.push('<!--[-->');

				Rect($$renderer, $.spread_props([
					region(),
					parts.root,
					{
						class: cls('lc-brush-root fill-transparent cursor-crosshair', classes.root),
						get ref() {
							return regionEl;
						},

						set ref($$value) {
							regionEl = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (brushState.active) {
				$$renderer.push('<!--[0-->');

				if (Rect) {
					$$renderer.push('<!--[-->');

					Rect($$renderer, $.spread_props([
						selection(),
						parts.move,
						{
							ondblclick: clear,
							class: cls('lc-brush-selection cursor-move', classes.selection)
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <!--[-->`);

				const each_array = $.ensure_array_like(handles());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let handle = each_array[$$index];

					if (Rect) {
						$$renderer.push('<!--[-->');

						Rect($$renderer, $.spread_props([
							handleRect(handle.edge),
							parts[handle.edge],
							{ class: cls('lc-brush-handle', handle.cursor, classes.handle) }
						]));

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { state: stateProp });
	});
}