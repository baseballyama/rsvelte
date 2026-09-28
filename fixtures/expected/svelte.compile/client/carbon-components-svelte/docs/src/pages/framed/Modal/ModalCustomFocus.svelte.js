import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Stack, TextInput } from "carbon-components-svelte";

var root = $.from_html(`<p>Create a new Cloudant database in the US South region.</p> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ModalCustomFocus($$anchor, $$props) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Create database');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		modalHeading: 'Create database',
		primaryButtonText: 'Confirm',
		secondaryButtonText: 'Cancel',
		selectorPrimaryFocus: '#advanced-options',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:button--secondary': () => open = false,
			open: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			close: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			submit: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				gap: 3,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.sibling($.first_child(fragment_2), 2);

					TextInput(node_2, {
						id: 'db-name',
						labelText: 'Database name',
						placeholder: 'Enter database name...'
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						id: 'advanced-options',
						kind: 'ghost',
						size: 'small',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Advanced options');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}