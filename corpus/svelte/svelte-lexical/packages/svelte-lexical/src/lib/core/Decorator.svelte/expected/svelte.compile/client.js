import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeRegister } from '@lexical/utils';
import { DecoratorNode } from 'lexical';
import { getAllContexts, mount, onMount } from 'svelte';
import { getEditor } from './composerContext.js';

export default function Decorator($$anchor, $$props) {
	$.push($$props, true);

	const contexts = getAllContexts();
	const editor = getEditor();

	// cache for svelte components' props
	const components = {};

	// cache for dirty components identified by mutation listener (cache is cleared after decorator listener renders them)
	const dirtyComponents = [];

	onMount(() => {
		// register Mutation Listener for all Decorator Node types (except where skipDecorateRender = true)
		// 1- capture dirty nodes (`dirtyComponents`)
		// 2- remove SvelteComponent from cache (`components`) for destroyed nodes
		const unregisterCallBacks = [];

		editor._nodes.forEach((n) => {
			if (n.klass.prototype instanceof DecoratorNode && !n.klass.skipDecorateRender) {
				let unreg = editor.registerMutationListener(n.klass, (nodes, payload) => {
					for (let [key, val] of nodes) {
						if (val === 'destroyed') {
							delete components[key];
						} else {
							dirtyComponents.push(key);
						}
					}
				});

				unregisterCallBacks.push(unreg);
			}
		});

		return mergeRegister(
			...unregisterCallBacks,
			// register Decorator listener to render nodes
			// use dirty nodes identified by the mutation listener
			// 1- set `props` on existing svelte components
			// 2- create new components and put them in cache
			editor.registerDecoratorListener((decorators) => {
				dirtyComponents.forEach((nodeKey) => {
					const decorator = decorators[nodeKey];
					const com = components[nodeKey];
					const element = editor.getElementByKey(nodeKey);

					if (element?.innerHTML && com) {
						const props = components[nodeKey];

						decorator.updateProps(props);
					} else if (element) {
						// render component to target and save reference in cache
						const props = $.proxy({});

						decorator.updateProps(props);
						components[nodeKey] = props;
						mount(decorator.componentClass, { target: element, props, context: contexts });
					}
				});

				dirtyComponents.length = 0;
			})
		);
	});

	$.pop();
}