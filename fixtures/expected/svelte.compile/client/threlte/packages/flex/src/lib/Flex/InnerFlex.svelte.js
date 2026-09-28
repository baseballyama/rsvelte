import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, currentWritable, useTask } from '@threlte/core';
import { onDestroy } from 'svelte';
import { Box3, Group, Vector3 } from 'three';
import { Direction } from 'yoga-layout';
import { createUseDimensionsContext } from '../hooks/useDimensions.js';
import { getDepthAxis } from '../lib/getDepthAxis.js';
import { getOrientedBoundingBoxSize } from '../lib/getOrientedBoundingBoxSize.js';
import { getRootShift } from '../lib/getRootShift.js';
import { applyNodeProps } from '../lib/props.js';
import { propsChanged } from '../lib/propsChanged.js';
import { createNodeContext } from '../nodes/context.js';
import { createFlexContext } from './context.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'yoga',
	'width',
	'height',
	'plane',
	'direction',
	'scaleFactor',
	'classParser',
	'class',
	'reflowStage',
	'ref',
	'onreflow',
	'children'
]);

export default function InnerFlex($$anchor, $$props) {
	$.push($$props, true);

	const $mainAxis = () => $.store_get(mainAxis, '$mainAxis', $$stores);
	const $crossAxis = () => $.store_get(crossAxis, '$crossAxis', $$stores);
	const $depthAxis = () => $.store_get(depthAxis, '$depthAxis', $$stores);
	const $computedWidth = () => $.store_get(computedWidth, '$computedWidth', $$stores);
	const $computedHeight = () => $.store_get(computedHeight, '$computedHeight', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let width = $.prop($$props, 'width', 3, 1),
		height = $.prop($$props, 'height', 3, 1),
		plane = $.prop($$props, 'plane', 3, 'xy'),
		direction = $.prop($$props, 'direction', 3, 'LTR'),
		scaleFactor = $.prop($$props, 'scaleFactor', 3, 1000),
		_class = $.prop($$props, 'class', 3, ''),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	ref(new Group());
	ref(ref().userData.isNode = true, true);

	const boundingBox = new Box3();
	const vec3 = new Vector3();

	/**
	 * Create the context for `useDimensions`
	 */
	const { width: computedWidth, height: computedHeight } = createUseDimensionsContext();

	let shouldReflow = $.state(false);
	const reflow = () => $.set(shouldReflow, true);

	/**
	 * Reflowing inside useTask automatically batches reflows to 1 per frame.
	 */
	useTask(
		Symbol('threlte-flex-reflow'),
		() => {
			flexContext.emit('reflow:before');

			for (const { node, group, props } of flexContext.nodes.values()) {
				const scaledWidth = typeof props.width === 'number' ? props.width * scaleFactor() : props.width;
				const scaledHeight = typeof props.height === 'number' ? props.height * scaleFactor() : props.height;

				if (scaledWidth !== undefined && scaledHeight !== undefined) {
					// Forced size, no need to calculate bounding box
					node.setWidth(scaledWidth);

					node.setHeight(scaledHeight);
				} else if (node.getChildCount() === 0) {
					// No size specified, calculate size
					if (ref()) {
						getOrientedBoundingBoxSize(group, ref(), boundingBox, vec3);
					} else {
						// ref is missing for some reason, let's just use usual bounding box
						boundingBox.setFromObject(group).getSize(vec3);
					}

					node.setWidth(scaledWidth || vec3[$mainAxis()] * scaleFactor());
					node.setHeight(scaledHeight || vec3[$crossAxis()] * scaleFactor());
				}
			}

			rootNode.calculateLayout(width() * scaleFactor(), height() * scaleFactor(), Direction[direction()]);

			const rootWidth = rootNode.getComputedWidth();
			const rootHeight = rootNode.getComputedHeight();
			let minX = 0;
			let maxX = 0;
			let minY = 0;
			let maxY = 0;

			// Reposition after recalculation
			for (const { node, group } of flexContext.nodes.values()) {
				const { left, top, width, height } = node.getComputedLayout();
				const [mainAxisShift, crossAxisShift] = getRootShift(rootWidth, rootHeight, node);

				group.position[$mainAxis()] = (mainAxisShift + left) / scaleFactor();
				group.position[$crossAxis()] = -(crossAxisShift + top) / scaleFactor();
				group.position[$depthAxis()] = 0;
				minX = Math.min(minX, left);
				minY = Math.min(minY, top);
				maxX = Math.max(maxX, left + width);
				maxY = Math.max(maxY, top + height);
			}

			flexContext.emit('reflow:after');
			computedWidth.set((maxX - minX) / scaleFactor());
			computedHeight.set((maxY - minY) / scaleFactor());
			$$props.onreflow?.({ width: computedWidth.current, height: computedHeight.current });
			$.set(shouldReflow, false);
		},
		{
			stage: $$props.reflowStage,
			running: () => $.get(shouldReflow)
		}
	);

	const flexContext = createFlexContext({
		yoga: $$props.yoga,
		nodes: new Map(),
		addNode(node, group, props) {
			flexContext.nodes.set(node, { node, group, props });
			reflow();
		},

		updateNodeProps(node, props, force = false) {
			const nodeData = flexContext.nodes.get(node);

			// Updating the props can be forced and is done so on the initial call.
			if (force || propsChanged(node, props)) {
				applyNodeProps(node, props, scaleFactor());
				reflow();

				if (nodeData) nodeData.props = props;
			}
		},

		removeNode(node) {
			flexContext.nodes.delete(node);
			reflow();
		},
		rootWidth: currentWritable(width()),
		rootHeight: currentWritable(height()),
		scaleFactor: currentWritable(scaleFactor() ?? 1000),
		mainAxis: currentWritable(plane()[0]),
		crossAxis: currentWritable(plane()[1]),
		depthAxis: currentWritable(getDepthAxis(plane())),
		rootGroup: ref(),
		reflow,
		classParser: $$props.classParser
	});

	const rootNode = $$props.yoga.Node.create();

	createNodeContext(rootNode);

	const { mainAxis, crossAxis, depthAxis } = flexContext;

	$.user_pre_effect(() => {
		rootNode.setWidth(width() * scaleFactor());
		rootNode.setHeight(height() * scaleFactor());
	});

	flexContext.updateNodeProps(rootNode, { ...$$props.classParser?.(_class(), {}), ...props }, true);

	$.user_pre_effect(() => {
		flexContext.updateNodeProps(rootNode, { ...$$props.classParser?.(_class(), {}), ...props });
	});

	$.user_pre_effect(() => {
		flexContext.rootWidth.set(width());
		flexContext.reflow();
	});

	$.user_pre_effect(() => {
		flexContext.rootHeight.set(height());
		flexContext.reflow();
	});

	$.user_pre_effect(() => {
		flexContext.mainAxis.set(plane()[0]);
		flexContext.reflow();
	});

	$.user_pre_effect(() => {
		flexContext.crossAxis.set(plane()[1]);
		flexContext.reflow();
	});

	$.user_pre_effect(() => {
		flexContext.depthAxis.set(getDepthAxis(plane()));
		flexContext.reflow();
	});

	$.user_pre_effect(() => {
		flexContext.scaleFactor.set(scaleFactor());
		flexContext.reflow();
	});

	onDestroy(() => {
		rootNode.free();
	});

	T($$anchor, {
		get is() {
			return ref();
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ reflow, width: $computedWidth(), height: $computedHeight() }));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}