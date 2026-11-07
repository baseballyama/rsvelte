import * as $ from 'svelte/internal/server';
import NodeRenderer from '../../NodeRenderer.svelte';
import { useTypedNode } from '$lib/node.svelte';

export default function Metadata($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({
				nodeId,
				uiTree,
				type: ['Detail.Metadata', 'List.Item.Detail.Metadata']
			}))),
			node = $.derived(() => $$d().node);

		if (node()) {
			$$renderer.push(`<!--[0--><div class="flex flex-col gap-4"><!--[-->`);

			const each_array = $.ensure_array_like(node().children);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let childId = each_array[$$index];

				NodeRenderer($$renderer, { nodeId: childId, uiTree, onDispatch });
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}