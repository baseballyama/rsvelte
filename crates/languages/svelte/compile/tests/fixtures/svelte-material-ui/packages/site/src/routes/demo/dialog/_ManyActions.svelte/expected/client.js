import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _ManyActions($$anchor) {
	let open = $.state(false);
	let buttoned = $.state('Nothing yet.');
	var fragment = root_1();
	var node = $.first_child(fragment);

	Dialog(node, {
		'aria-labelledby': 'buttons-title',
		'aria-describedby': 'buttons-content',
		autoStackButtons: false,
		onSMUIDialogClosed: (e) => $.set(buttoned, e.detail.action, true),
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Title(node_1, {
				id: 'buttons-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Use speed bost?');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'buttons-content',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Speed boost opens the extra holes in your device to increase aerodynamics.\n    This allows your device to reach higher maximum speed, increasing your\n    productivity.');

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
						action: 'no',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('No Thanks');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						action: 'later',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Remind Me Later');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						action: 'speed-bost',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Turn on Speed Boost');

									$.append($$anchor, text_4);
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

	var node_7 = $.sibling(node, 2);

	Button(node_7, {
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

	var pre = $.sibling(node_7, 2);
	var text_6 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_6, `Action: ${$.get(buttoned) ?? ''}`));
	$.append($$anchor, fragment);
}