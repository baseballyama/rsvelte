import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { createSubscriber } from 'svelte/reactivity';
import { on } from 'svelte/events';
import { cls } from '@layerstack/tailwind';
import { portal as portalAction } from '@layerstack/svelte-actions/portal';
import { dataCoords } from '$lib/utils/tooltip.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { panelDatum } from '$lib/utils/tooltip.js';
import { createMotion } from '$lib/utils/motion.svelte.js';
import Self from './Tooltip.svelte';

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			anchor = 'top-left',
			classes = {},
			contained = 'container',
			fadeDuration = 100,
			motion = 'spring',
			pointerEvents = false,
			portal: portalProp = true,
			variant = 'default',
			data: dataProp,
			facetAll = false,
			x = 'pointer',
			xOffset = x === 'pointer' || facetAll ? 10 : 0,
			y = 'pointer',
			yOffset = y === 'pointer' || facetAll ? 10 : 0,
			children,
			rootRef: rootRefProp = void 0,
			props = { root: {}, container: {}, content: {} },
			class: className
		} = $$props;

		let rootRef = void 0;

		// Imports itself to render the per-panel copies of `facetAll`
		const ctx = getChartContext();

		/** The row this tooltip shows — its own when given, else whatever the pointer resolved */
		const tooltipData = $.derived(() => dataProp ?? ctx.tooltip.data);

		let tooltipWidth = null;
		let tooltipHeight = null;

		function alignValue(value, align, additionalOffset, tooltipSize) {
			const alignOffset = align === 'center' ? tooltipSize / 2 : align === 'end' ? tooltipSize : 0;

			return value + (align === 'end' ? -additionalOffset : additionalOffset) - alignOffset;
		}

		const isPortaled = $.derived(() => typeof portalProp === 'boolean' ? portalProp : portalProp?.enabled !== false);

		/**
		 * Makes reading the container's viewport rect reactive to scrolling and resizing.
		 *
		 * A portaled tooltip is positioned from the chart container's *viewport* rect, and
		 * `getBoundingClientRect()` is not reactive — scrolling moves the chart out from under a
		 * tooltip that never re-measures.  Pointer-driven tooltips mostly dodge this (scrolling fires
		 * `pointercancel`, or a pointer event as content moves under the cursor), but one shown
		 * programmatically — keyboard navigation, a chart group, `locked` — has no pointer to cancel it
		 * and must follow the chart.
		 *
		 * `createSubscriber` ties the listeners to whether anything is actually reading: they attach
		 * when `positions` starts depending on this and detach when it stops, so an idle chart costs
		 * nothing.
		 *
		 * `capture` is what catches scrolling of any *ancestor* (ex. a dashboard inside a scrolling
		 * panel), not just the window — which is also why `scrollY` from `svelte/reactivity/window`
		 * isn't enough here, and why runed's `ScrollState` (bound to one element) doesn't fit either.
		 */
		const subscribeToViewport = createSubscriber((update) => {
			const offScroll = on(window, 'scroll', update, { capture: true, passive: true });
			const offResize = on(window, 'resize', update, { passive: true });

			return () => {
				offScroll();
				offResize();
			};
		});

		const positions = $.derived(() => {
			// if no data or tooltip size is not known yet, return null
			if (!tooltipData() || tooltipWidth === null || tooltipHeight === null) {
				return { x: null, y: null };
			}

			// Only track the viewport while there is a portaled tooltip to keep positioned
			if (isPortaled()) subscribeToViewport();

			// When portaled, we need the container's viewport rect to convert coordinates
			const containerRect = isPortaled() ? ctx.containerRef?.getBoundingClientRect() : null;

			// If portaled but the container rect is not available yet, bail
			if (isPortaled() && !containerRect) {
				return { x: null, y: null };
			}

			// Container-relative position of the tooltip data, used by the `'data'` placement
			const coords = x === 'data' || y === 'data' ? dataCoords(ctx, tooltipData()) : null;

			const xValue = typeof x === 'number' ? x : x === 'data' ? coords.x : ctx.tooltip.x;
			let xAlign = 'start';

			switch (anchor) {
				case 'top-left':

				case 'left':

				case 'bottom-left':
					xAlign = 'start';
					break;

				case 'top':

				case 'center':

				case 'bottom':
					xAlign = 'center';
					break;

				case 'top-right':

				case 'right':

				case 'bottom-right':
					xAlign = 'end';
					break;
			}

			const yValue = typeof y === 'number' ? y : y === 'data' ? coords.y : ctx.tooltip.y;
			let yAlign = 'start';

			switch (anchor) {
				case 'top-left':

				case 'top':

				case 'top-right':
					yAlign = 'start';
					break;

				case 'left':

				case 'center':

				case 'right':
					yAlign = 'center';
					break;

				case 'bottom-left':

				case 'bottom':

				case 'bottom-right':
					yAlign = 'end';
					break;
			}

			const rect = {
				top: alignValue(yValue, yAlign, yOffset, tooltipHeight),
				left: alignValue(xValue, xAlign, xOffset, tooltipWidth),
				// set below
				bottom: 0,
				right: 0
			};

			rect.bottom = rect.top + tooltipHeight;
			rect.right = rect.left + tooltipWidth;

			if (contained === 'container') {
				if (isPortaled() && containerRect) {
					// Containment in viewport coordinates
					if (typeof x !== 'number') {
						if ((xAlign === 'start' || xAlign === 'center') && containerRect.left + rect.right > containerRect.right) {
							rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
						}

						if ((xAlign === 'end' || xAlign === 'center') && containerRect.left + rect.left < containerRect.left + ctx.padding.left) {
							rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
						}
					}

					rect.right = rect.left + tooltipWidth;

					if (typeof y !== 'number') {
						if ((yAlign === 'start' || yAlign === 'center') && containerRect.top + rect.bottom > containerRect.bottom) {
							rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
						}

						if ((yAlign === 'end' || yAlign === 'center') && containerRect.top + rect.top < containerRect.top + ctx.padding.top) {
							rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
						}
					}

					rect.bottom = rect.top + tooltipHeight;
				} else {
					// Original non-portaled container containment
					if (typeof x !== 'number') {
						// Check if outside of container and swap align side accordingly
						if ((xAlign === 'start' || xAlign === 'center') && rect.right > ctx.containerWidth) {
							rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
						}

						if ((xAlign === 'end' || xAlign === 'center') && rect.left < ctx.padding.left) {
							rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
						}
					}

					rect.right = rect.left + tooltipWidth;

					if (typeof y !== 'number') {
						if ((yAlign === 'start' || yAlign === 'center') && rect.bottom > ctx.containerHeight) {
							rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
						}

						if ((yAlign === 'end' || yAlign === 'center') && rect.top < ctx.padding.top) {
							rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
						}
					}

					rect.bottom = rect.top + tooltipHeight;
				}
			} else if (contained === 'window') {
				if (isPortaled() && containerRect) {
					// Already in viewport coordinates, just clamp to window
					if (typeof x !== 'number') {
						if ((xAlign === 'start' || xAlign === 'center') && containerRect.left + rect.right > window.innerWidth) {
							rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
						}

						if ((xAlign === 'end' || xAlign === 'center') && containerRect.left + rect.left < 0) {
							rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
						}
					}

					rect.right = rect.left + tooltipWidth;

					if (typeof y !== 'number') {
						if ((yAlign === 'start' || yAlign === 'center') && containerRect.top + rect.bottom > window.innerHeight) {
							rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
						}

						if ((yAlign === 'end' || yAlign === 'center') && containerRect.top + rect.top < 0) {
							rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
						}
					}

					rect.bottom = rect.top + tooltipHeight;
				} else {
					// Original non-portaled window containment
					// Root <div> won't be available on initial mount
					if (rootRef?.parentElement) {
						const parentViewportRect = rootRef.parentElement.getBoundingClientRect();

						// Only attempt repositioning if not fixed (ie. `pointer`/`data`)
						if (typeof x !== 'number') {
							if ((xAlign === 'start' || xAlign === 'center') && parentViewportRect.left + rect.right > window.innerWidth) {
								rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
							}

							if ((xAlign === 'end' || xAlign === 'center') && parentViewportRect.left + rect.left < 0) {
								rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
							}
						}

						rect.right = rect.left + tooltipWidth;

						if (typeof y !== 'number') {
							if ((yAlign === 'start' || yAlign === 'center') && parentViewportRect.top + rect.bottom > window.innerHeight) {
								rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
							}

							if ((yAlign === 'end' || yAlign === 'center') && parentViewportRect.top + rect.top < 0) {
								rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
							}
						}

						rect.bottom = rect.top + tooltipHeight;
					}
				}
			}

			// When portaled, convert from container-relative to viewport-relative coordinates
			const offsetX = isPortaled() && containerRect ? containerRect.left : 0;

			const offsetY = isPortaled() && containerRect ? containerRect.top : 0;

			return { x: rect.left + offsetX, y: rect.top + offsetY };
		});

		const motionX = createMotion(null, () => positions().x, motion);
		const motionY = createMotion(null, () => positions().y, motion);

		if (facetAll && ctx.facet.enabled && dataProp === undefined) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(ctx.facet.panels);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let panel = each_array[$$index];
				const row = panelDatum(ctx, panel, ctx.tooltip.data);

				if (row) {
					$$renderer.push('<!--[0-->');

					Self($$renderer, {
						data: row,
						x: x === 'pointer' ? 'data' : x,
						y: y === 'pointer' ? 'data' : y,
						anchor,
						xOffset,
						yOffset,
						classes,
						contained,
						fadeDuration,
						motion,
						pointerEvents,
						portal: portalProp,
						variant,
						props,
						class: className,
						children
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (tooltipData() && !ctx.tooltip.suppressed) {
			$$renderer.push(`<!--[1--><div${$.attributes(
				{
					...props.root,
					class: $.clsx(cls('lc-tooltip-root', classes.root, props.root?.class))
				},
				'svelte-1svrttd',
				{
					disablePointerEvents: pointerEvents === false,
					portaled: isPortaled()
				},
				{
					top: `${$.stringify(motionY.current)}px`,
					left: `${$.stringify(motionX.current)}px`
				}
			)}><div${$.attributes(
				{
					...props.container,
					class: $.clsx(cls('lc-tooltip-container', classes.container, props.container?.class, className)),
					'data-variant': variant
				},
				'svelte-1svrttd'
			)}>`);

			if (children) {
				$$renderer.push(`<!--[0--><div${$.attributes(
					{
						...props.content,
						class: $.clsx(cls('lc-tooltip-content', classes.content))
					},
					'svelte-1svrttd'
				)}>`);

				children($$renderer, { data: tooltipData() });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { rootRef: rootRefProp });
	});
}