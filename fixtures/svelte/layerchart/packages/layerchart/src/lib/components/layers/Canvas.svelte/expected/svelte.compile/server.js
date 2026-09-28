import * as $ from 'svelte/internal/server';
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

export default function Canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref: refProp = void 0,
			canvasContext: canvasContextProp = void 0,
			ssrCapture,
			ssrCaptureCallback,
			willReadFrequently = false,
			debug = false,
			zIndex = 0,
			pointerEvents = true,
			fallback,
			center = false,
			ignoreTransform = false,
			disableHitCanvas = false,
			class: className,
			children: childrenProp,
			onclick,
			ondblclick,
			onpointerenter,
			onpointermove,
			onpointerleave,
			onpointerdown,
			ontouchmove,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		let context = void 0;
		const ctx = getChartContext();
		const logger = new Logger('Canvas');

		// Root node for the component tree — children register via ctx.registerComponent
		const rootNode = ctx.registerComponent({ name: 'Canvas', kind: 'group' });

		let pendingInvalidation = false;
		let frameId;

		/**
		 * HitCanvas
		 */
		let hitCanvasElement = void 0;

		let hitCanvasContext = void 0;
		let colorGenerator = rgbColorGenerator();
		let activeCanvas = false;
		let lastActiveNode = null;
		const nodeByColor = new Map();

		function getPointerNode(e) {
			const { x, y } = localPoint(e);
			const color = getPixelColor(hitCanvasContext, x, y);
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
			activeCanvas = true;

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
			activeCanvas = false;
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
			context = ref?.getContext('2d', { willReadFrequently });

			hitCanvasContext = hitCanvasElement?.getContext('2d', {
				willReadFrequently: false // Explicitly set to `false` to resolve pixel artifacts between fill and stroke with the same color (issue #372)
			});

			return () => {
				if (frameId) {
					cancelAnimationFrame(frameId);
				}
			};
		});

		function update() {
			if (!context) return;

			// scale main canvas
			scaleCanvas(context, ctx.containerWidth, ctx.containerHeight);

			context.clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);

			// apply padding translation
			context.translate(ctx.padding.left ?? 0, ctx.padding.top ?? 0);

			let newTranslate;

			// apply centering or transform
			if (center) {
				newTranslate = {
					x: center === 'x' || center === true ? ctx.width / 2 : 0,
					y: center === 'y' || center === true ? ctx.height / 2 : 0
				};

				context.translate(newTranslate.x, newTranslate.y);
			} else if (ctx.transform.mode === 'canvas' && !ignoreTransform) {
				context.translate(ctx.transform.translate.x, ctx.transform.translate.y);
				context.scale(ctx.transform.scale, ctx.transform.scale);
			}

			// Recursively render the component tree with proper save/restore scoping
			renderTree(context, rootNode);

			/*
			 * Sync hit canvas with main canvas
			 */
			if (hitCanvasContext) {
				const inactiveMoving = !activeCanvas && ctx.transform.moving;

				if (disableHitCanvas || ctx.transform.dragging || inactiveMoving) {
					// Skip rendering hit canvas
					hitCanvasContext.clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);
				} else {
					// scale hit canvas to match main canvas
					scaleCanvas(hitCanvasContext, ctx.containerWidth, ctx.containerHeight);

					hitCanvasContext.clearRect(0, 0, ctx.containerWidth, ctx.containerHeight);

					// sync transform with main canvas (padding, center, zoom already applied)
					hitCanvasContext.setTransform(context.getTransform());

					// reset color generator and node map
					colorGenerator = rgbColorGenerator();

					nodeByColor.clear();

					// render hit canvas tree
					renderHitTree(hitCanvasContext, rootNode);
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
			if (!ssrCapture && !ssrCaptureCallback) return '';

			const captured = { chartState: ctx, rootNode };

			if (ssrCapture) {
				Object.assign(ssrCapture, captured);
			}

			ssrCaptureCallback?.(captured);

			return '';
		}

		const canvasContext = createCanvasContext();

		setCanvasContext(canvasContext);
		setLayerContext('canvas');

		$$renderer.push(`<canvas${$.attributes(
			{
				class: $.clsx(['lc-layout-canvas', className]),
				...// Prevent touch from interfering with pointer if over data
				restProps
			},
			'svelte-13zvwyt',
			{ disablePointerEvents: pointerEvents === false },
			{ 'z-index': zIndex }
		)}>`);

		if (fallback) {
			$$renderer.push('<!--[0-->');

			if (typeof fallback === 'function') {
				$$renderer.push('<!--[0-->');
				fallback($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(fallback)}`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></canvas> <canvas${$.attr_class('lc-hit-canvas svelte-13zvwyt', void 0, { 'debug': debug })}></canvas> `);

		{
			function children($$renderer, { facet }) {
				childrenProp?.($$renderer, { ref, canvasContext: context, facet });
				$$renderer.push(`<!---->`);
			}

			Facet($$renderer, { children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> ${$.escape(captureSSR())}`);
		$.bind_props($$props, { ref: refProp, canvasContext: canvasContextProp });
	});
}