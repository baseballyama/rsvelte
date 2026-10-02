import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div><div><!></div></div>`);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	let anchor = $.prop($$props, 'anchor', 3, 'top-left'),
		classes = $.prop($$props, 'classes', 19, () => ({})),
		contained = $.prop($$props, 'contained', 3, 'container'),
		fadeDuration = $.prop($$props, 'fadeDuration', 3, 100),
		motion = $.prop($$props, 'motion', 3, 'spring'),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, false),
		portalProp = $.prop($$props, 'portal', 3, true),
		variant = $.prop($$props, 'variant', 3, 'default'),
		facetAll = $.prop($$props, 'facetAll', 3, false),
		x = $.prop($$props, 'x', 3, 'pointer'),
		xOffset = $.prop($$props, 'xOffset', 19, () => x() === 'pointer' || facetAll() ? 10 : 0),
		y = $.prop($$props, 'y', 3, 'pointer'),
		yOffset = $.prop($$props, 'yOffset', 19, () => y() === 'pointer' || facetAll() ? 10 : 0),
		rootRefProp = $.prop($$props, 'rootRef', 15),
		props = $.prop($$props, 'props', 19, () => ({ root: {}, container: {}, content: {} }));

	let rootRef = $.state(void 0);

	$.user_pre_effect(() => {
		rootRefProp($.get(rootRef));
	});

	// Imports itself to render the per-panel copies of `facetAll`
	const ctx = getChartContext();

	/** The row this tooltip shows — its own when given, else whatever the pointer resolved */
	const tooltipData = $.derived(() => $$props.data ?? ctx.tooltip.data);

	let tooltipWidth = $.state(null);
	let tooltipHeight = $.state(null);

	function alignValue(value, align, additionalOffset, tooltipSize) {
		const alignOffset = align === 'center' ? tooltipSize / 2 : align === 'end' ? tooltipSize : 0;

		return value + (align === 'end' ? -additionalOffset : additionalOffset) - alignOffset;
	}

	const isPortaled = $.derived(() => typeof portalProp() === 'boolean' ? portalProp() : portalProp()?.enabled !== false);

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
		if (!$.get(tooltipData) || $.get(tooltipWidth) === null || $.get(tooltipHeight) === null) {
			return { x: null, y: null };
		}

		// Only track the viewport while there is a portaled tooltip to keep positioned
		if ($.get(isPortaled)) subscribeToViewport();

		// When portaled, we need the container's viewport rect to convert coordinates
		const containerRect = $.get(isPortaled) ? ctx.containerRef?.getBoundingClientRect() : null;

		// If portaled but the container rect is not available yet, bail
		if ($.get(isPortaled) && !containerRect) {
			return { x: null, y: null };
		}

		// Container-relative position of the tooltip data, used by the `'data'` placement
		const coords = x() === 'data' || y() === 'data' ? dataCoords(ctx, $.get(tooltipData)) : null;

		const xValue = typeof x() === 'number' ? x() : x() === 'data' ? coords.x : ctx.tooltip.x;
		let xAlign = 'start';

		switch (anchor()) {
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

		const yValue = typeof y() === 'number' ? y() : y() === 'data' ? coords.y : ctx.tooltip.y;
		let yAlign = 'start';

		switch (anchor()) {
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
			top: alignValue(yValue, yAlign, yOffset(), $.get(tooltipHeight)),
			left: alignValue(xValue, xAlign, xOffset(), $.get(tooltipWidth)),
			// set below
			bottom: 0,
			right: 0
		};

		rect.bottom = rect.top + $.get(tooltipHeight);
		rect.right = rect.left + $.get(tooltipWidth);

		if (contained() === 'container') {
			if ($.get(isPortaled) && containerRect) {
				// Containment in viewport coordinates
				if (typeof x() !== 'number') {
					if ((xAlign === 'start' || xAlign === 'center') && containerRect.left + rect.right > containerRect.right) {
						rect.left = alignValue(xValue, 'end', xOffset(), $.get(tooltipWidth));
					}

					if ((xAlign === 'end' || xAlign === 'center') && containerRect.left + rect.left < containerRect.left + ctx.padding.left) {
						rect.left = alignValue(xValue, 'start', xOffset(), $.get(tooltipWidth));
					}
				}

				rect.right = rect.left + $.get(tooltipWidth);

				if (typeof y() !== 'number') {
					if ((yAlign === 'start' || yAlign === 'center') && containerRect.top + rect.bottom > containerRect.bottom) {
						rect.top = alignValue(yValue, 'end', yOffset(), $.get(tooltipHeight));
					}

					if ((yAlign === 'end' || yAlign === 'center') && containerRect.top + rect.top < containerRect.top + ctx.padding.top) {
						rect.top = alignValue(yValue, 'start', yOffset(), $.get(tooltipHeight));
					}
				}

				rect.bottom = rect.top + $.get(tooltipHeight);
			} else {
				// Original non-portaled container containment
				if (typeof x() !== 'number') {
					// Check if outside of container and swap align side accordingly
					if ((xAlign === 'start' || xAlign === 'center') && rect.right > ctx.containerWidth) {
						rect.left = alignValue(xValue, 'end', xOffset(), $.get(tooltipWidth));
					}

					if ((xAlign === 'end' || xAlign === 'center') && rect.left < ctx.padding.left) {
						rect.left = alignValue(xValue, 'start', xOffset(), $.get(tooltipWidth));
					}
				}

				rect.right = rect.left + $.get(tooltipWidth);

				if (typeof y() !== 'number') {
					if ((yAlign === 'start' || yAlign === 'center') && rect.bottom > ctx.containerHeight) {
						rect.top = alignValue(yValue, 'end', yOffset(), $.get(tooltipHeight));
					}

					if ((yAlign === 'end' || yAlign === 'center') && rect.top < ctx.padding.top) {
						rect.top = alignValue(yValue, 'start', yOffset(), $.get(tooltipHeight));
					}
				}

				rect.bottom = rect.top + $.get(tooltipHeight);
			}
		} else if (contained() === 'window') {
			if ($.get(isPortaled) && containerRect) {
				// Already in viewport coordinates, just clamp to window
				if (typeof x() !== 'number') {
					if ((xAlign === 'start' || xAlign === 'center') && containerRect.left + rect.right > window.innerWidth) {
						rect.left = alignValue(xValue, 'end', xOffset(), $.get(tooltipWidth));
					}

					if ((xAlign === 'end' || xAlign === 'center') && containerRect.left + rect.left < 0) {
						rect.left = alignValue(xValue, 'start', xOffset(), $.get(tooltipWidth));
					}
				}

				rect.right = rect.left + $.get(tooltipWidth);

				if (typeof y() !== 'number') {
					if ((yAlign === 'start' || yAlign === 'center') && containerRect.top + rect.bottom > window.innerHeight) {
						rect.top = alignValue(yValue, 'end', yOffset(), $.get(tooltipHeight));
					}

					if ((yAlign === 'end' || yAlign === 'center') && containerRect.top + rect.top < 0) {
						rect.top = alignValue(yValue, 'start', yOffset(), $.get(tooltipHeight));
					}
				}

				rect.bottom = rect.top + $.get(tooltipHeight);
			} else {
				// Original non-portaled window containment
				// Root <div> won't be available on initial mount
				if ($.get(rootRef)?.parentElement) {
					const parentViewportRect = $.get(rootRef).parentElement.getBoundingClientRect();

					// Only attempt repositioning if not fixed (ie. `pointer`/`data`)
					if (typeof x() !== 'number') {
						if ((xAlign === 'start' || xAlign === 'center') && parentViewportRect.left + rect.right > window.innerWidth) {
							rect.left = alignValue(xValue, 'end', xOffset(), $.get(tooltipWidth));
						}

						if ((xAlign === 'end' || xAlign === 'center') && parentViewportRect.left + rect.left < 0) {
							rect.left = alignValue(xValue, 'start', xOffset(), $.get(tooltipWidth));
						}
					}

					rect.right = rect.left + $.get(tooltipWidth);

					if (typeof y() !== 'number') {
						if ((yAlign === 'start' || yAlign === 'center') && parentViewportRect.top + rect.bottom > window.innerHeight) {
							rect.top = alignValue(yValue, 'end', yOffset(), $.get(tooltipHeight));
						}

						if ((yAlign === 'end' || yAlign === 'center') && parentViewportRect.top + rect.top < 0) {
							rect.top = alignValue(yValue, 'start', yOffset(), $.get(tooltipHeight));
						}
					}

					rect.bottom = rect.top + $.get(tooltipHeight);
				}
			}
		}

		// When portaled, convert from container-relative to viewport-relative coordinates
		const offsetX = $.get(isPortaled) && containerRect ? containerRect.left : 0;

		const offsetY = $.get(isPortaled) && containerRect ? containerRect.top : 0;

		return { x: rect.left + offsetX, y: rect.top + offsetY };
	});

	const motionX = createMotion(null, () => $.get(positions).x, motion());
	const motionY = createMotion(null, () => $.get(positions).y, motion());

	$.user_effect(() => {
		if (!ctx.tooltip.data) {
			ctx.tooltip.isHoveringTooltipContent = false;
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => ctx.facet.panels, (panel) => panel.key, ($$anchor, panel) => {
				const row = $.derived(() => panelDatum(ctx, $.get(panel), ctx.tooltip.data));
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						{
							let $0 = $.derived(() => x() === 'pointer' ? 'data' : x());
							let $1 = $.derived(() => y() === 'pointer' ? 'data' : y());

							Self($$anchor, {
								get data() {
									return $.get(row);
								},

								get x() {
									return $.get($0);
								},

								get y() {
									return $.get($1);
								},

								get anchor() {
									return anchor();
								},

								get xOffset() {
									return xOffset();
								},

								get yOffset() {
									return yOffset();
								},

								get classes() {
									return classes();
								},

								get contained() {
									return contained();
								},

								get fadeDuration() {
									return fadeDuration();
								},

								get motion() {
									return motion();
								},

								get pointerEvents() {
									return pointerEvents();
								},

								get portal() {
									return portalProp();
								},

								get variant() {
									return variant();
								},

								get props() {
									return props();
								},

								get class() {
									return $$props.class;
								},

								get children() {
									return $$props.children;
								}
							});
						}
					};

					$.if(node_2, ($$render) => {
						if ($.get(row)) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_3 = ($$anchor) => {
			var div = root_1();

			var event_handler = () => {
				ctx.tooltip.isHoveringTooltipContent = true;
			};

			var event_handler_1 = () => {
				ctx.tooltip.isHoveringTooltipContent = false;
			};

			$.attribute_effect(
				div,
				($0) => ({
					...props().root,
					class: $0,
					onpointerenter: event_handler,
					onpointerleave: event_handler_1,
					[$.CLASS]: {
						disablePointerEvents: pointerEvents() === false,
						portaled: $.get(isPortaled)
					},
					[$.STYLE]: {
						top: `${motionY.current ?? ''}px`,
						left: `${motionX.current ?? ''}px`
					}
				}),
				[
					() => cls('lc-tooltip-root', classes().root, props().root?.class)
				],
				void 0,
				void 0,
				'svelte-1svrttd'
			);

			var div_1 = $.child(div);

			$.attribute_effect(
				div_1,
				($0) => ({ ...props().container, class: $0, 'data-variant': variant() }),
				[
					() => cls('lc-tooltip-container', classes().container, props().container?.class, $$props.class)
				],
				void 0,
				void 0,
				'svelte-1svrttd'
			);

			var node_3 = $.child(div_1);

			{
				var consequent_2 = ($$anchor) => {
					var div_2 = root();

					$.attribute_effect(div_2, ($0) => ({ ...props().content, class: $0 }), [() => cls('lc-tooltip-content', classes().content)], void 0, void 0, 'svelte-1svrttd');

					var node_4 = $.child(div_2);

					$.snippet(node_4, () => $$props.children, () => ({ data: $.get(tooltipData) }));
					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_3, ($$render) => {
					if ($$props.children) $$render(consequent_2);
				});
			}

			$.reset(div_1);
			$.reset(div);
			$.action(div, ($$node, $$action_arg) => portalAction?.($$node, $$action_arg), portalProp);
			$.effect(() => $.bind_element_size(div, 'clientWidth', ($$value) => $.set(tooltipWidth, $$value)));
			$.effect(() => $.bind_element_size(div, 'clientHeight', ($$value) => $.set(tooltipHeight, $$value)));
			$.bind_this(div, ($$value) => $.set(rootRef, $$value), () => $.get(rootRef));
			$.transition(3, div, () => fade, () => ({ duration: fadeDuration() }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (facetAll() && ctx.facet.enabled && $$props.data === undefined) $$render(consequent_1); else if ($.get(tooltipData) && !ctx.tooltip.suppressed) $$render(consequent_3, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}