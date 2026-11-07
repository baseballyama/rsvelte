import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';

var root = $.from_html(
	`Before you continue on this page, you must answer my riddle of age. When
    Alice was six her brother was half, now Alice is 90, you do the math. <br/><br/> How old is Alice's brother now?`,
	1
);

var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _Mandatory($$anchor) {
	let open = $.state(false);
	let response = $.state('Nothing yet.');
	var fragment = root_3();
	var node = $.first_child(fragment);

	Dialog(node, {
		scrimClickAction: '',
		escapeKeyAction: '',
		'aria-labelledby': 'mandatory-title',
		'aria-describedby': 'mandatory-content',
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			Title(node_1, {
				id: 'mandatory-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Webpage Troll');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'mandatory-content',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();

					$.next(3);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Actions(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					Button(node_4, {
						onclick: () => $.set(response, 'Wrong answer. Thrown in the lake.'),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Fifty');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						onclick: () => $.set(response, 'You are correct. You may pass.'),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Eighty-Seven');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						onclick: () => $.set(response, 'Wrong answer. Thrown in the lake.'),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Forty-Five');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						onclick: () => $.set(response, 'Wrong answer. Thrown in the lake.'),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Seventy-Five');

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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node, 2);

	Button(node_8, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Open Dialog');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_8, 2);
	var text_6 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_6, `Result: ${$.get(response) ?? ''}`));
	$.append($$anchor, fragment);
}