import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Menu from '@smui/menu';
import List, { Item, Separator, Text } from '@smui/list';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div style="min-width: 100px;"><!> <!></div> <pre class="status"> </pre>`, 1);

export default function _Anchored($$anchor) {
	let menu;
	let clicked = $.state('nothing yet');
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => menu.setOpen(true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open Menu');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		Menu(node_1, {
			children: ($$anchor, $$slotProps) => {
				List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_2 = $.first_child(fragment_3);

						Item(node_2, {
							onSMUIAction: () => $.set(clicked, 'Cut'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Cut');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						Item(node_3, {
							onSMUIAction: () => $.set(clicked, 'Copy'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Copy');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Item(node_4, {
							onSMUIAction: () => $.set(clicked, 'Paste'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Paste');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						Separator(node_5, {});

						var node_6 = $.sibling(node_5, 2);

						Item(node_6, {
							onSMUIAction: () => $.set(clicked, 'Delete'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Delete');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}),
		($$value) => menu = $$value,
		() => menu
	);

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_5 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_5, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}