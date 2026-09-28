import * as $ from 'svelte/internal/server';
import Detail from '$lib/components/nodes/detail/Detail.svelte';
import { useTypedNode } from '$lib/node.svelte';

export default function ItemDetail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'List.Item.Detail' }))),
			node = $.derived(() => $$d().node),
			detailProps = $.derived(() => $$d().props);

		if (node() && detailProps()) {
			$$renderer.push('<!--[0-->');
			Detail($$renderer, { nodeId, uiTree, onDispatch, layout: 'vertical' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}