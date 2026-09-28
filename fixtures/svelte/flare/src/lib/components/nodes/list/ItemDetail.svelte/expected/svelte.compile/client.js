import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Detail from '$lib/components/nodes/detail/Detail.svelte';
import { useTypedNode } from '$lib/node.svelte';

export default function ItemDetail($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: 'List.Item.Detail'
		}))),
		node = $.derived(() => $.get($$d).node),
		detailProps = $.derived(() => $.get($$d).props);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Detail($$anchor, {
				get nodeId() {
					return $$props.nodeId;
				},

				get uiTree() {
					return $$props.uiTree;
				},

				get onDispatch() {
					return $$props.onDispatch;
				},
				layout: 'vertical'
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(detailProps)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}