import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '$lib/components/ui/button';
import Icon from '$lib/components/Icon.svelte';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<div><h3 class="text-muted-foreground mb-1 text-xs font-medium"> </h3> <!></div>`);

export default function MetadataLink($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: ['Detail.Metadata.Link', 'List.Item.Detail.Metadata.Link']
		}))),
		componentProps = $.derived(() => $.get($$d).props);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var h3 = $.child(div);
			var text = $.only_child(h3, true);
			var node_1 = $.sibling(h3, 2);

			Button(node_1, {
				get href() {
					return $.get(componentProps).target;
				},

				onclick: (e) => {
					e.preventDefault();
					openUrl($.get(componentProps).target);
				},
				class: 'group text-foreground flex h-auto justify-between !p-0',
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();
					var text_1 = $.first_child(fragment_1);
					var node_2 = $.sibling(text_1);

					Icon(node_2, {
						icon: 'arrow-ne-16',
						class: 'text-muted-foreground group-hover:text-foreground size-4'
					});

					$.template_effect(() => $.set_text(text_1, `${$.get(componentProps).text ?? ''} `));
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(componentProps).title));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(componentProps)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}