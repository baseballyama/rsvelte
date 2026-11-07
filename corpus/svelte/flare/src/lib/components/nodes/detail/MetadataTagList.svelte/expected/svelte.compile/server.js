import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import NodeRenderer from '../../NodeRenderer.svelte';

export default function MetadataTagList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({
				nodeId,
				uiTree,
				type: [
					'Detail.Metadata.TagList',
					'List.Item.Detail.Metadata.TagList'
				]
			}))),
			node = $.derived(() => $$d().node),
			componentProps = $.derived(() => $$d().props);

		if (node() && componentProps()) {
			$$renderer.push(`<!--[0--><div><h3 class="mb-1 text-xs font-medium text-gray-500 uppercase">${$.escape(componentProps().title)}</h3> <div class="flex flex-wrap items-center gap-1.5"><!--[-->`);

			const each_array = $.ensure_array_like(node().children);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let childId = each_array[$$index];

				NodeRenderer($$renderer, { nodeId: childId, uiTree, onDispatch });
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}