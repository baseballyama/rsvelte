import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Facet from '../Facet.svelte';
import { onMount, untrack } from 'svelte';
import { Logger, localPoint } from '@layerstack/utils';
import { MediaQueryPresets } from '@layerstack/svelte-state';
import { getChartContext } from '$lib/contexts/chart.js';
import { setLayerContext } from '$lib/contexts/layer.js';
import { getPixelColor, scaleCanvas } from '../../utils/canvas.js';
import { getColorStr, rgbColorGenerator } from '../../utils/color.js';
import { useMutationObserver, watch } from 'runed';
import { setCanvasContext } from '$lib/contexts/canvas.js';
import { renderTree } from '$lib/server/renderTree.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'canvasContext',
	'ssrCapture',
	'ssrCaptureCallback',
	'willReadFrequently',
	'debug',
	'zIndex',
	'pointerEvents',
	'fallback',
	'center',
	'ignoreTransform',
	'disableHitCanvas',
	'class',
	'children',
	'onclick',
	'ondblclick',
	'onpointerenter',
	'onpointermove',
	'onpointerleave',
	'onpointerdown',
	'ontouchmove'
]);

var root = $.from_html(`<canvas><!></canvas> <canvas></canvas> <!> `, 1);

export default function Canvas($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		canvasContextProp = $.prop($$props, 'canvasContext', 15),
		willReadFrequently = $.prop($$props, 'willReadFrequently', 3, false),
		debug = $.prop($$props, 'debug', 3, false),
		zIndex = $.prop($$props, 'zIndex', 3, 0),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, true),
		center = $.prop($$props, 'center', 3, false),
		ignoreTransform = $.prop($$props, 'ignoreTransform', 3, false),
		disableHitCanvas = $.prop($$props, 'disableHitCanvas', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);
	let context = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	$.user_pre_effect(() => {
		canvasContextProp($.get(context));
	});

	const ctx = getChartContext();
	const logger = new Logger('Canvas');

	// Root node for the component tree — children register via ctx.registerComponent
	const rootNode = ctx.registerComponent({ name: 'Canvas', kind: 'group' });

	let pendingInvalidation = false;
	let frameId;

	/**
	 * HitCanvas
	 */
	let hitCanvasElement = $.state(void 0);

	let hitCanvasContext = $.state(void 0);
	let colorGenerator = rgbColorGenerator();
	let activeCanvas = $.state(false);
	let lastActiveNode = null;
	const nodeByColor = new Map();

	function getPointerNode(e) {
		const { x, y } = localPoint(e);
		const color = getPixelColor($.get(hitCanvasContext), x, y);
		const colorKey = getColorStr(color);
		const node = nodeByColor.get(colorKey);

		logger.debug({ colorKey, node, nodeByColor });

		return node;
	}

	/**
	 * Walk up the component tree from a node and call the given event on any
	 * ancestor groups that have a handler for it, simulating DOM event bubbling.
	 */
	function bubbleEvent(node, eventName, e) {
		// Fire event on the hit node itself
		(node?.canvasRender?.events?.[eventName])?.(e);

		// Bubble up to ancestor groups
		let ancestor = node?.parent;

		while (ancestor) {
			const handler = ancestor.kind === 'group'
				? ancestor.canvasRender?.events?.[eventName]
				: undefined;

			handler?.(e);
			ancestor = ancestor.parent;
		}
	}

	const onPointerMove = (e) => {
		$.set(activeCanvas, true);

		const node = getPointerNode(e);

		if (node != lastActiveNode) {
			// TODO: Should `pointerleave`/`pointerout` and `pointerenter`/`pointerover` be handled differently?
			if (lastActiveNode) {
				bubbleEvent(lastActiveNode, 'pointerleave', e);
				bubbleEvent(lastActiveNode, 'pointerout', e);
			}

			bubbleEvent(node, 'pointerenter', e);
			bubbleEvent(node, 'pointerover', e);
		}

		bubbleEvent(node, 'pointermove', e);
		lastActiveNode = node;
	};

	const onPointerLeave = (e) => {
		// Pointer outside of canvas
		// Call last active component `pointerleave` event in case it was not triggered by hit canvas (quickly exiting canvas element before `pointermove` is triggered)
		bubbleEvent(lastActiveNode, 'pointerleave', e);

		bubbleEvent(lastActiveNode, 'pointerout', e);
		lastActiveNode = null;
		$.set(activeCanvas, false);
	};

	/**
	 * end HitCanvas
	 */
	// Invalidate/redraw if color scheme changes, either via browser `prefers-color-scheme` (including emulation) or by changing `<html class="dark">` or `<html data-theme="...">`
	if (typeof window !== 'undefined') {
		const { dark } = new MediaQueryPresets();

		watch(() => dark.current, () => {
			canvasContext.invalidate();
		});

		useMutationObserver(() => document.documentElement, () => canvasContext.invalidate(), { attributes: true, attributeFilter: ['class', 'data-theme'] });
	}

	onMount(() => {
		$.set(context, $.get(ref)?.getContext('2d', { willReadFrequently: willReadFrequently() }), true);

		$.set(
			hitCanvasContext,
			$.get(hitCanvasElement)?.getContext('2d', {
				willReadFrequently: false // Explicitly set to `false` to resolve pixel artifacts between fill and stroke with the same color (issue #372)
			}),
			true
		);

		return () => {
			if (frameId) {
				cancelAnimationFrame(frameId);
			}
		};
	});

	function update() {
		if (!$.get(context)) return;

		// scale main canvas
		scaleCanvas($.get(context), ctx.containerWidth, ctx.containerHeight);

		$.get(context).clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);

		// apply padding translation
		$.get(context).translate(ctx.padding.left ?? 0, ctx.padding.top ?? 0);

		let newTranslate;

		// apply centering or transform
		if (center()) {
			newTranslate = {
				x: center() === 'x' || center() === true ? ctx.width / 2 : 0,
				y: center() === 'y' || center() === true ? ctx.height / 2 : 0
			};

			$.get(context).translate(newTranslate.x, newTranslate.y);
		} else if (ctx.transform.mode === 'canvas' && !ignoreTransform()) {
			$.get(context).translate(ctx.transform.translate.x, ctx.transform.translate.y);
			$.get(context).scale(ctx.transform.scale, ctx.transform.scale);
		}

		// Recursively render the component tree with proper save/restore scoping
		renderTree($.get(context), rootNode);

		/*
		 * Sync hit canvas with main canvas
		 */
		if ($.get(hitCanvasContext)) {
			const inactiveMoving = !$.get(activeCanvas) && ctx.transform.moving;

			if (disableHitCanvas() || ctx.transform.dragging || inactiveMoving) {
				// Skip rendering hit canvas
				$.get(hitCanvasContext).clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);
			} else {
				// scale hit canvas to match main canvas
				scaleCanvas($.get(hitCanvasContext), ctx.containerWidth, ctx.containerHeight);

				$.get(hitCanvasContext).clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);

				// sync transform with main canvas (padding, center, zoom already applied)
				$.get(hitCanvasContext).setTransform($.get(context).getTransform());

				// reset color generator and node map
				colorGenerator = rgbColorGenerator();

				nodeByColor.clear();

				// render hit canvas tree
				renderHitTree($.get(hitCanvasContext), rootNode);
			}
		}

		pendingInvalidation = false;
	}

	function nodeHasEvents(node) {
		return node.canvasRender?.events && Object.values(node.canvasRender.events).some((d) => d);
	}

	/**
	 * Recursively render the hit canvas tree for pointer event detection.
	 * Renders components that have event handlers (or whose ancestor group does), using unique colors.
	 */
	function renderHitTree(hitCtx, node, ancestorHasEvents = false) {
		if (node.kind === 'group' && node.canvasRender) {
			const groupHasEvents = ancestorHasEvents || nodeHasEvents(node);

			// Group: apply transform, recurse children (scoped by save/restore)
			hitCtx.save();

			node.canvasRender.render(hitCtx);

			for (const child of node.children) {
				renderHitTree(hitCtx, child, groupHasEvents);
			}

			hitCtx.restore();
		} else if (node.canvasRender) {
			if (nodeHasEvents(node) || ancestorHasEvents) {
				const color = getColorStr(colorGenerator.next().value);
				const styleOverrides = { styles: { fill: color, stroke: color, _fillOpacity: 0.1 } };

				hitCtx.save();
				node.canvasRender.render(hitCtx, styleOverrides);
				hitCtx.restore();
				nodeByColor.set(color, node);
			}
		} else {
			// Non-rendering node: recurse children
			for (const child of node.children) {
				renderHitTree(hitCtx, child, ancestorHasEvents);
			}
		}
	}

	function createCanvasContext() {
		// Legacy register method — registration is now handled by the component tree
		// via registerComponent. Keep for interface compatibility.
		function register(_component) {
			return () => {};
		}

		function invalidate() {
			if (pendingInvalidation) return;
			if (typeof requestAnimationFrame === 'undefined') return;

			pendingInvalidation = true;
			frameId = requestAnimationFrame(update);
		}

		function getRootNode() {
			return rootNode;
		}

		return { register, invalidate, getRootNode };
	}

	function captureSSR() {
		if (typeof window !== 'undefined') return '';
		if (!$$props.ssrCapture && !$$props.ssrCaptureCallback) return '';

		const captured = { chartState: ctx, rootNode };

		if ($$props.ssrCapture) {
			Object.assign($$props.ssrCapture, captured);
		}

		$$props.ssrCaptureCallback?.(captured);

		return '';
	}

	const canvasContext = createCanvasContext();

	$.user_pre_effect(() => {
		[
			ctx.height,
			ctx.width,
			ctx.containerHeight,
			ctx.containerWidth,
			ctx.transform.dragging
		];

		canvasContext.invalidate();
	});

	setCanvasContext(canvasContext);
	setLayerContext('canvas');

	var fragment = root();
	var canvas = $.first_child(fragment);

	var event_handler = (e) => {
		const node = getPointerNode(e);

		bubbleEvent(node, 'click', e);
		$$props.onclick?.(e);
	};

	var event_handler_1 = (e) => {
		const node = getPointerNode(e);

		bubbleEvent(node, 'dblclick', e);
		$$props.ondblclick?.(e);
	};

	var event_handler_2 = (e) => {
		const node = getPointerNode(e);

		bubbleEvent(node, 'pointerdown', e);
		$$props.onpointerdown?.(e);
	};

	var event_handler_3 = (e) => {
		$$props.onpointerenter?.(e);
		onPointerMove(e);
	};

	var event_handler_4 = (e) => {
		$$props.onpointermove?.(e);
		onPointerMove(e);
	};

	var event_handler_5 = (e) => {
		$$props.onpointerleave?.(e);
		onPointerLeave(e);
	};

	var event_handler_6 = (e) => {
		// Prevent touch from interfering with pointer if over data
		if (lastActiveNode) {
			e.preventDefault();
		}

		const node = getPointerNode(e);

		bubbleEvent(node, 'touchmove', e);
	};

	$.attribute_effect(
		canvas,
		() => ({
			class: ['lc-layout-canvas', $$props.class],
			onclick: event_handler,
			ondblclick: event_handler_1,
			onpointerdown: event_handler_2,
			onpointerenter: event_handler_3,
			onpointermove: event_handler_4,
			onpointerleave: event_handler_5,
			ontouchmove: event_handler_6,
			...restProps,
			[$.CLASS]: { disablePointerEvents: pointerEvents() === false },
			[$.STYLE]: { 'z-index': zIndex() }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-13zvwyt'
	);

	var node_1 = $.child(canvas);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.snippet(node_3, () => $$props.fallback);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $$props.fallback));
					$.append($$anchor, text);
				};

				$.if(node_2, ($$render) => {
					if (typeof $$props.fallback === 'function') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.fallback) $$render(consequent_1);
		});
	}

	$.reset(canvas);
	$.bind_this(canvas, ($$value) => $.set(ref, $$value), () => $.get(ref));

	var canvas_1 = $.sibling(canvas, 2);
	let classes;

	$.bind_this(canvas_1, ($$value) => $.set(hitCanvasElement, $$value), () => $.get(hitCanvasElement));

	var node_4 = $.sibling(canvas_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let facet = () => ($$arg0?.()).facet;
			var fragment_4 = $.comment();
			var node_5 = $.first_child(fragment_4);

			$.snippet(node_5, () => $$props.children ?? $.noop, () => ({
				ref: $.get(ref),
				canvasContext: $.get(context),
				facet: facet()
			}));

			$.append($$anchor, fragment_4);
		};

		Facet(node_4, { children, $$slots: { default: true } });
	}

	var text_1 = $.sibling(node_4);

	$.template_effect(
		($0) => {
			classes = $.set_class(canvas_1, 1, 'lc-hit-canvas svelte-13zvwyt', null, classes, { debug: debug() });
			$.set_text(text_1, ` ${$0 ?? ''}`);
		},
		[() => captureSSR()]
	);

	$.append($$anchor, fragment);
	$.pop();
}