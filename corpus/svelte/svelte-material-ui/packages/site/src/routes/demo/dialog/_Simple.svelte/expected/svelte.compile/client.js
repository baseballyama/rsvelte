import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _Simple($$anchor) {
	let open = $.state(false);
	let clicked = $.state('Nothing yet.');
	var fragment = root_2();
	var node = $.first_child(fragment);

	Dialog(node, {
		'aria-labelledby': 'simple-title',
		'aria-describedby': 'simple-content',
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Title(node_1, {
				id: 'simple-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dialog Title');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'simple-content',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Super awesome dialog body text?');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Actions(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					Button(node_4, {
						onclick: () => $.set(clicked, 'No'),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('No');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						onclick: () => $.set(clicked, 'Yes'),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Yes');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Button(node_6, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Open Dialog');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_6, 2);
	var text_5 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_5, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}