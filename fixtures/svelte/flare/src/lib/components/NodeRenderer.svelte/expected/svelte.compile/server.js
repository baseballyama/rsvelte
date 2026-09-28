import * as $ from 'svelte/internal/server';
import { componentMap } from '$lib/nodes';

export default function NodeRenderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch, $$slots, $$events, ...restProps } = $$props;
		const node = $.derived(() => uiTree.get(nodeId));
		const Component = $.derived(() => node() ? componentMap.get(node().type) : null);

		if (node() && Component()) {
			$$renderer.push('<!--[0-->');

			if (Component()) {
				$$renderer.push('<!--[-->');
				Component()($$renderer, $.spread_props([{ nodeId, uiTree, onDispatch }, restProps]));
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (node()) {
			$$renderer.push(`<!--[1--><div class="p-2 text-xs text-red-500">Unknown component type: ${$.escape(node().type)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}