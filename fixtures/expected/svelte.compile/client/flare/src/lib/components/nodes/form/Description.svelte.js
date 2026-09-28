import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';

var root = $.from_html(`<h3 class="text-muted-foreground pt-2 text-right text-sm font-medium"> </h3>`);
var root_1 = $.from_html(`<div class="flex gap-4"><!> <p class="text-muted-foreground col-start-2 pt-2 text-sm"> </p></div>`);

export default function Description($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: 'Form.Description'
		}))),
		node = $.derived(() => $.get($$d).node),
		componentProps = $.derived(() => $.get($$d).props);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var node_2 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var h3 = root();
					var text = $.only_child(h3, true);

					$.template_effect(() => $.set_text(text, $.get(componentProps).title));
					$.append($$anchor, h3);
				};

				$.if(node_2, ($$render) => {
					if ($.get(componentProps).title) $$render(consequent);
				});
			}

			var p = $.sibling(node_2, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div);
			$.template_effect(() => $.set_text(text_1, $.get(componentProps).text));
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(componentProps)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}