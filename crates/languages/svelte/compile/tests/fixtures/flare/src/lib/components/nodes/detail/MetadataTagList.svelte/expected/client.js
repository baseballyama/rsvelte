import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import NodeRenderer from '../../NodeRenderer.svelte';

var root = $.from_html(`<div><h3 class="mb-1 text-xs font-medium text-gray-500 uppercase"> </h3> <div class="flex flex-wrap items-center gap-1.5"></div></div>`);

export default function MetadataTagList($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: [
				'Detail.Metadata.TagList',
				'List.Item.Detail.Metadata.TagList'
			]
		}))),
		node = $.derived(() => $.get($$d).node),
		componentProps = $.derived(() => $.get($$d).props);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var h3 = $.child(div);
			var text = $.only_child(h3, true);
			var div_1 = $.sibling(h3, 2);

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
			$.template_effect(() => $.set_text(text, $.get(componentProps).title));
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(componentProps)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}