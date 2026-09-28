import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { onDestroy } from 'svelte';
import { Group, Object3D } from 'three';
import { useFlex } from '../Flex/context.js';
import { createUseDimensionsContext } from '../hooks/useDimensions.js';
import { createNodeContext } from '../nodes/context.js';

export default function Box($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			order,
			class: _class = '',
			onreflow,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

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

		parentNodeContext?.insertNode(node, order);

		onDestroy(() => {
			parentNodeContext?.removeNode(node);
		});

		// update the order of the node
		addNode(node, group, props);

		updateNodeProps(node, { ...classParser?.(_class, {}), ...props }, true);

		onDestroy(() => {
			removeNode(node);
		});

		let computedWidth = 1;
		let computedHeight = 1;

		// after the parent has been reflowed, we can use the calculated layout to set the properties of the box
		onEvent('reflow:after', () => {
			computedWidth = typeof props.width === 'number'
				? props.width
				: node.getComputedWidth() / $.store_get($$store_subs ??= {}, '$scaleFactor', scaleFactor);

			computedHeight = typeof props.height === 'number'
				? props.height
				: node.getComputedHeight() / $.store_get($$store_subs ??= {}, '$scaleFactor', scaleFactor);

			contentGroup.position[$.store_get($$store_subs ??= {}, '$mainAxis', mainAxis)] = computedWidth / 2;
			contentGroup.position[$.store_get($$store_subs ??= {}, '$crossAxis', crossAxis)] = -computedHeight / 2;
			contentGroup.position[$.store_get($$store_subs ??= {}, '$depthAxis', depthAxis)] = 0;
			dimensionsContext.width.set(computedWidth);
			dimensionsContext.height.set(computedHeight);
			onreflow?.({ width: computedWidth, height: computedHeight });
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

		T($$renderer, {
			is: group,
			children: ($$renderer) => {
				T($$renderer, { is: contentGroup });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		T($$renderer, {
			is: proxy,
			attach: false,
			children: ($$renderer) => {
				children?.($$renderer, { reflow, width: computedWidth, height: computedHeight });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}