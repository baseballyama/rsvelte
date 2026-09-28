import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _Event($$anchor) {
	let open = $.state(false);
	let response = $.state('Nothing yet.');

	function closeHandler(e) {
		switch (e.detail.action) {
			case 'none':
				$.set(response, "Ok, well, you're wrong.");
				break;

			case 'all':
				$.set(response, 'You are correct. All dogs are the best dog.');
				break;

			default:
				// This means the user clicked the scrim or pressed Esc to close the dialog.
				// The actions will be "close".
				$.set(response, "It's a simple question. You should be able to answer it.");
				break;
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Dialog(node, {
		'aria-labelledby': 'event-title',
		'aria-describedby': 'event-content',
		onSMUIDialogClosed: closeHandler,
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
				id: 'event-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('The Best Dog');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'event-content',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Out of all the dogs, which is the best dog?');

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
						action: 'none',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('None of Them');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						action: 'all',
						defaultAction: true,
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('All of Them');

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

	$.template_effect(() => $.set_text(text_5, `Response: ${$.get(response) ?? ''}`));
	$.append($$anchor, fragment);
}