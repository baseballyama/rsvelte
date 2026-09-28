import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List, { Item, Graphic, Separator, Text } from '@smui/list';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="svelte-pgll8m"><!></div> <pre class="status svelte-pgll8m"> </pre>`, 1);

export default function _GraphicsDense($$anchor) {
	let clicked = $.state('nothing yet');
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	List(node, {
		class: 'demo-list',
		dense: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Item(node_1, {
				onSMUIAction: () => $.set(clicked, 'Edit'),
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Graphic(node_2, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('edit');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Text(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Edit');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Item(node_4, {
				onSMUIAction: () => $.set(clicked, 'Send'),
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					Graphic(node_5, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('send');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Text(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Send');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Item(node_7, {
				onSMUIAction: () => $.set(clicked, 'Archive'),
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_8 = $.first_child(fragment_4);

					Graphic(node_8, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('archive');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Text(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Archive');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_7, 2);

			Separator(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			Item(node_11, {
				onSMUIAction: () => $.set(clicked, 'Delete'),
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_12 = $.first_child(fragment_5);

					Graphic(node_12, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('clear');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					Text(node_13, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Delete');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_8 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_8, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}