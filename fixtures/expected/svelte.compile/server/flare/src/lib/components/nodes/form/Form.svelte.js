import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';

export default function Form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'Form' }))),
			node = $.derived(() => $$d().node),
			formProps = $.derived(() => $$d().props);

		if (node() && formProps()) {
			$$renderer.push(`<!--[0--><div class="flex h-full flex-col p-4"><div class="flex flex-col gap-4"><!--[-->`);

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