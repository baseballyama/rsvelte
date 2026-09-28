import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { onDestroy } from 'svelte';
import { Group, Object3D } from 'three';
import { useFlex } from '../Flex/context.js';
import { createUseDimensionsContext } from '../hooks/useDimensions.js';
import { createNodeContext } from '../nodes/context.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'order',
	'class',
	'onreflow',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Box($$anchor, $$props) {
	$.push($$props, true);

	const $scaleFactor = () => $.store_get(scaleFactor, '$scaleFactor', $$stores);
	const $mainAxis = () => $.store_get(mainAxis, '$mainAxis', $$stores);
	const $crossAxis = () => $.store_get(crossAxis, '$crossAxis', $$stores);
	const $depthAxis = () => $.store_get(depthAxis, '$depthAxis', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let _class = $.prop($$props, 'class', 3, ''),
		props = $.rest_props($$props, rest_excludes);

	/**
	 * Create the context for `useDimensions`
	 */
	const dimensionsContext = createUseDimensionsContext();

	const {
		scaleFactor,
		onEvent,
		addNode,
		removeNode,
		updateNodeProps,
		mainAxis,
		crossAxis,
		depthAxis,
		classParser,
		reflow
	} = useFlex();

	const group = new Group();

	group.userData.isNode = true;

	const contentGroup = new Group();
	const { yoga } = useFlex();
	const node = yoga.Node.create();
	const parentNodeContext = createNodeContext(node);

	parentNodeContext?.insertNode(node, $$props.order);

	onDestroy(() => {
		parentNodeContext?.removeNode(node);
	});

	// update the order of the node
	$.user_pre_effect(() => parentNodeContext?.updateNodeOrder(node, $$props.order));

	addNode(node, group, props);
	updateNodeProps(node, { ...classParser?.(_class(), {}), ...props }, true);
	$.user_pre_effect(() => updateNodeProps(node, { ...classParser?.(_class(), {}), ...props }));

	onDestroy(() => {
		removeNode(node);
	});

	let computedWidth = $.state(1);
	let computedHeight = $.state(1);

	// after the parent has been reflowed, we can use the calculated layout to set the properties of the box
	onEvent('reflow:after', () => {
		$.set(
			computedWidth,
			typeof $$props.width === 'number'
				? $$props.width
				: node.getComputedWidth() / $scaleFactor(),
			true
		);

		$.set(
			computedHeight,
			typeof $$props.height === 'number'
				? $$props.height
				: node.getComputedHeight() / $scaleFactor(),
			true
		);

		contentGroup.position[$mainAxis()] = $.get(computedWidth) / 2;
		contentGroup.position[$crossAxis()] = -$.get(computedHeight) / 2;
		contentGroup.position[$depthAxis()] = 0;
		dimensionsContext.width.set($.get(computedWidth));
		dimensionsContext.height.set($.get(computedHeight));
		$$props.onreflow?.({ width: $.get(computedWidth), height: $.get(computedHeight) });
	});

	const proxy = new Object3D();

	proxy.add = (child) => {
		if (child.userData.isNode) {
			group.add(child);
		} else {
			contentGroup.add(child);
		}

		return child;
	};

	proxy.remove = (child) => {
		if (child.userData.isNode) {
			group.remove(child);
		} else {
			contentGroup.remove(child);
		}

		return child;
	};

	var fragment = root();
	var node_1 = $.first_child(fragment);

	T(node_1, {
		get is() {
			return group;
		},

		children: ($$anchor, $$slotProps) => {
			T($$anchor, {
				get is() {
					return contentGroup;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	T(node_2, {
		get is() {
			return proxy;
		},
		attach: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $$props.children ?? $.noop, () => ({
				reflow,
				width: $.get(computedWidth),
				height: $.get(computedHeight)
			}));

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}