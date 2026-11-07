import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';
import Textfield from '@smui/textfield';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _DynamicText($$anchor) {
	let snackbar;
	let text = $.state('This is a snackbar with dynamic text.');
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.bind_this(
		Snackbar(node, {
			get labelText() {
				return $.get(text);
			},
			timeoutMs: -1,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Label(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				Actions(node_2, {
					children: ($$anchor, $$slotProps) => {
						IconButton($$anchor, {
							title: 'Dismiss',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('close');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}),
		($$value) => snackbar = $$value,
		() => snackbar
	);

	var node_3 = $.sibling(node, 2);

	Textfield(node_3, {
		label: 'Dynamic Text',
		required: true,
		get value() {
			return $.get(text);
		},

		set value($$value) {
			$.set(text, $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		onclick: () => snackbar.open(),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Open Snackbar');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}