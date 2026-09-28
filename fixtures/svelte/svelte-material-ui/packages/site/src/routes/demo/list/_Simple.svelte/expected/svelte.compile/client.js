import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List, { Item, Separator, Text } from '@smui/list';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-eam788"><!></div> <pre class="status svelte-eam788"> </pre>`, 1);

export default function _Simple($$anchor) {
	let clicked = $.state('nothing yet');
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	List(node, {
		class: 'demo-list',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Item(node_1, {
				onSMUIAction: () => $.set(clicked, 'Cut'),
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Cut');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Item(node_2, {
				onSMUIAction: () => $.set(clicked, 'Copy'),
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Copy');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Item(node_3, {
				onSMUIAction: () => $.set(clicked, 'Paste'),
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Paste');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Separator(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			Item(node_5, {
				onSMUIAction: () => $.set(clicked, 'Delete'),
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Delete');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_4 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_4, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}