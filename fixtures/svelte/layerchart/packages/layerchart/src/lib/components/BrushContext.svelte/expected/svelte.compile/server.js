import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { brushable } from '$lib/attachments/brushable.js';
import { cls } from '@layerstack/tailwind';
import { Logger } from '@layerstack/utils';
import { getChartContext } from '$lib/contexts/chart.js';
import { BrushState } from '$lib/states/brush.svelte.js';

export default function BrushContext($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();

		let {
			x,
			y,
			state: stateProp = void 0,
			axis = 'x',
			handleSize = 5,
			clickToReset = true,
			disabled = false,
			minExtent,
			maxExtent,
			constrain,
			constrainToDomain = true,
			range = {},
			handle = {},
			classes = {},
			onBrushEnd = () => {},
			onBrushStart = () => {},
			onChange = () => {},
			children
		} = $$props;

		let rootEl = void 0;

		const brushState = new BrushState(ctx, {
			x,
			y,
			axis,
			minExtent,
			maxExtent,
			constrain,
			constrainToDomain
		});

		stateProp = brushState;

		// Keep constraint config in sync when props change reactively
		const logger = new Logger('BrushContext');

		const RESET_THRESHOLD = 1; // size of pointer delta to ignore

		/**
		 * The gesture, from the `brushable` attachment — the same one a chart can attach to elements of
		 * its own.  Each part of the brush takes the mode it represents, so the handles keep their own
		 * cursors and hit areas, and the root creates a new selection.
		 */
		function gesture(mode) {
			return brushable({
				state: brushState,
				axis,
				mode,
				// Every part measures against the root, not against itself — a handle is only a few pixels
				bounds: () => rootEl?.getBoundingClientRect(),

				// The gesture belongs to the panel it started in, and stays there — the scales are shared,
				// so the selection it produces applies to every panel.  Unfaceted charts resolve to the
				// single full-size panel, and a point in the gap between panels to none, which ignores it.
				origin: (offset) => {
					const panel = ctx.facet.panelAt(offset.x, offset.y);

					if (!panel) {
						logger.debug('ignoring drag as outside of chart bounds', { offset });

						return null;
					}

					return { x: panel.x, y: panel.y };
				},
				clearThreshold: clickToReset ? RESET_THRESHOLD : 0,
				onChange: ({ phase }) => {
					if (phase === 'start') onBrushStart({ brush: brushState }); else if (phase === 'brush') onChange({ brush: brushState }); else onBrushEnd({ brush: brushState });
				}
			});
		}

		if (// Sync external x/y props into brush state when provided
		// Avoid tracking brushState internals to prevent reactive loops
		disabled) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer, { state: brushState });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(cls('lc-brush-context')), 'svelte-20h5iz')}${$.attr_style('', {
				top: `${$.stringify(ctx.padding.top)}px`,
				left: `${$.stringify(ctx.padding.left)}px`,
				width: `${$.stringify(ctx.box.width)}px`,
				height: `${$.stringify(ctx.box.height)}px`
			})}><div${$.attr_class($.clsx(cls('lc-brush-container')), 'svelte-20h5iz')}${$.attr_style('', {
				top: `-${$.stringify(ctx.padding.top ?? 0)}px`,
				left: `-${$.stringify(ctx.padding.left ?? 0)}px`,
				width: `${$.stringify(ctx.containerWidth)}px`,
				height: `${$.stringify(ctx.containerHeight)}px`
			})}>`);

			children?.($$renderer, { state: brushState });
			$$renderer.push(`<!----></div> `);

			if (brushState.active) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(ctx.facet.panels);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let panel = each_array[$$index];

					$$renderer.push(`<div class="lc-brush-panel svelte-20h5iz"${$.attr_style('', {
						left: `${$.stringify(panel.x)}px`,
						top: `${$.stringify(panel.y)}px`
					})}><div${$.attributes(
						{
							...range,
							class: $.clsx(cls('lc-brush-range', classes.range, range?.class))
						},
						'svelte-20h5iz',
						void 0,
						{
							left: `${$.stringify(brushState.range.x)}px`,
							top: `${$.stringify(brushState.range.y)}px`,
							width: `${$.stringify(brushState.range.width)}px`,
							height: `${$.stringify(brushState.range.height)}px`
						}
					)}></div> `);

					if (axis === 'both' || axis === 'y') {
						$$renderer.push(`<!--[0--><div${$.attributes(
							{
								...handle,
								'data-position': 'top',
								class: $.clsx(cls('lc-brush-handle', classes.handle, handle?.class))
							},
							'svelte-20h5iz',
							void 0,
							{
								left: `${$.stringify(brushState.range.x)}px`,
								top: `${$.stringify(brushState.range.y)}px`,
								width: `${$.stringify(brushState.range.width)}px`,
								height: `${$.stringify(handleSize)}px`
							}
						)}></div> <div${$.attributes(
							{
								...handle,
								'data-position': 'bottom',
								class: $.clsx(cls('lc-brush-handle', classes.handle, handle?.class))
							},
							'svelte-20h5iz',
							void 0,
							{
								left: `${$.stringify(brushState.range.x)}px`,
								top: `${$.stringify(brushState.range.y + brushState.range.height - handleSize)}px`,
								width: `${$.stringify(brushState.range.width)}px`,
								height: `${$.stringify(handleSize)}px`
							}
						)}></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (axis === 'both' || axis === 'x') {
						$$renderer.push(`<!--[0--><div${$.attributes(
							{
								...handle,
								'data-position': 'left',
								class: $.clsx(cls('lc-brush-handle', classes.handle, handle?.class))
							},
							'svelte-20h5iz',
							void 0,
							{
								left: `${$.stringify(brushState.range.x)}px`,
								top: `${$.stringify(brushState.range.y)}px`,
								width: `${$.stringify(handleSize)}px`,
								height: `${$.stringify(brushState.range.height)}px`
							}
						)}></div> <div${$.attributes(
							{
								...handle,
								'data-position': 'right',
								class: $.clsx(cls('lc-brush-handle', classes.handle, handle?.class))
							},
							'svelte-20h5iz',
							void 0,
							{
								left: `${$.stringify(brushState.range.x + brushState.range.width - handleSize + 1)}px`,
								top: `${$.stringify(brushState.range.y)}px`,
								width: `${$.stringify(handleSize)}px`,
								height: `${$.stringify(brushState.range.height)}px`
							}
						)}></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { state: stateProp });
	});
}