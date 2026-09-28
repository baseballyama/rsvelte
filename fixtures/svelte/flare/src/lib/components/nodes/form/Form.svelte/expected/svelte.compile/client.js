import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';

var root = $.from_html(`<div class="flex h-full flex-col p-4"><div class="flex flex-col gap-4"></div></div>`);

export default function Form($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({ nodeId: $$props.nodeId, uiTree: $$props.uiTree, type: 'Form' }))),
		node = $.derived(() => $.get($$d).node),
		formProps = $.derived(() => $.get($$d).props);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);

			$.each(div_1, 20, () => $.get(node).children, (childId) => childId, ($$anchor, childId) => {
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

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(formProps)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}