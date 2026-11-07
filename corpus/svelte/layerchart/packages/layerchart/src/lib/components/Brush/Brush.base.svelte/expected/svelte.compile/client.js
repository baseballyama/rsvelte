import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { getChartContext } from '$lib/contexts/chart.js';
import { BrushState as BrushStateClass } from '$lib/states/brush.svelte.js';
import { brushGesture } from '$lib/attachments/brushable.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Brush_base($$anchor, $$props) {
	$.push($$props, true);

	let // Aliased so `$state` in this file isn't read as a store subscription of the prop
		stateProp = $.prop($$props, 'state', 15),
		axis = $.prop($$props, 'axis', 3, 'x'),
		x = $.prop($$props, 'x', 3, 0),
		y = $.prop($$props, 'y', 3, 0),
		handleSize = $.prop($$props, 'handleSize', 3, 8),
		classes = $.prop($$props, 'classes', 19, () => ({}));

	const ctx = getChartContext();

	/** The region element, which every part measures against — a handle is only a few pixels wide */
	let regionEl = $.state(void 0);

	function bounds(node) {
		if ($.get(regionEl)) return $.get(regionEl).getBoundingClientRect();

		// Canvas draws its marks, so the node is the layer's own canvas — the region starts inside it
		const rect = node.getBoundingClientRect();

		return {
			left: rect.left + (ctx.padding.left ?? 0) + x(),
			top: rect.top + (ctx.padding.top ?? 0) + y()
		};
	}

	// Take the selection given, or own one — either way `bind:state` reads it back
	const brushState = stateProp() ?? new BrushStateClass(ctx, { axis: axis() });

	stateProp(brushState);

	const region = $.derived(() => ({
		x: x(),
		y: y(),
		width: $$props.width ?? ctx.width,
		height: $$props.height ?? ctx.height
	}));

	/**
	 * The selection, drawn within the region.
	 *
	 * `BrushState.range` spans the whole plot on an unbrushed axis, which is right for a chart-wide
	 * brush but not for one placed in a band of its own.
	 */
	const selection = $.derived(() => ({
		x: brushState.axis === 'y' ? $.get(region).x : brushState.range.x,
		width: brushState.axis === 'y' ? $.get(region).width : brushState.range.width,
		y: brushState.axis === 'x' ? $.get(region).y : brushState.range.y,
		height: brushState.axis === 'x' ? $.get(region).height : brushState.range.height
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
				onChange: (detail) => $$props.onChange?.(detail)
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
		$$props.onChange?.({ state: brushState, phase: 'end' });
	}

	function handleRect(edge) {
		const { x: sx, y: sy, width: sw, height: sh } = $.get(selection);

		switch (edge) {
			case 'top':
				return {
					x: sx,
					y: sy - handleSize() / 2,
					width: sw,
					height: handleSize()
				};

			case 'bottom':
				return {
					x: sx,
					y: sy + sh - handleSize() / 2,
					width: sw,
					height: handleSize()
				};

			case 'left':
				return {
					x: sx - handleSize() / 2,
					y: sy,
					width: handleSize(),
					height: sh
				};

			case 'right':
				return {
					x: sx + sw - handleSize() / 2,
					y: sy,
					width: handleSize(),
					height: sh
				};
		}
	}

	var fragment = root();
	var node_1 = $.first_child(fragment);

	{
		let $0 = $.derived(() => cls('lc-brush-root fill-transparent cursor-crosshair', classes().root));

		$.component(node_1, () => $$props.Rect, ($$anchor, Rect_1) => {
			Rect_1($$anchor, $.spread_props(() => $.get(region), () => parts.root, {
				get class() {
					return $.get($0);
				},

				get ref() {
					return $.get(regionEl);
				},

				set ref($$value) {
					$.set(regionEl, $$value, true);
				}
			}));
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cls('lc-brush-selection cursor-move', classes().selection));

				$.component(node_3, () => $$props.Rect, ($$anchor, Rect_2) => {
					Rect_2($$anchor, $.spread_props(() => $.get(selection), () => parts.move, {
						ondblclick: clear,
						get class() {
							return $.get($0);
						}
					}));
				});
			}

			var node_4 = $.sibling(node_3, 2);

			$.each(node_4, 17, () => $.get(handles), (handle) => handle.edge, ($$anchor, handle) => {
				var fragment_2 = $.comment();
				var node_5 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => handleRect($.get(handle).edge));
					let $1 = $.derived(() => cls('lc-brush-handle', $.get(handle).cursor, classes().handle));

					$.component(node_5, () => $$props.Rect, ($$anchor, Rect_3) => {
						Rect_3($$anchor, $.spread_props(() => $.get($0), () => parts[$.get(handle).edge], {
							get class() {
								return $.get($1);
							}
						}));
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (brushState.active) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}