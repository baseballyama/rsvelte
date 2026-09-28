import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NodeRenderer from '../../NodeRenderer.svelte';
import { useTypedNode } from '$lib/node.svelte';

var root = $.from_html(`<div class="flex flex-col gap-4"></div>`);

export default function Metadata($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: ['Detail.Metadata', 'List.Item.Detail.Metadata']
		}))),
		node = $.derived(() => $.get($$d).node);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.each(div, 20, () => $.get(node).children, (childId) => childId, ($$anchor, childId) => {
				NodeRenderer($$anchor, {
					get nodeId() {
						return childId;
					},

					get uiTree() {
						return $$props.uiTree;
					},

					get onDispatch() {
						return $$props.onDispatch;
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}