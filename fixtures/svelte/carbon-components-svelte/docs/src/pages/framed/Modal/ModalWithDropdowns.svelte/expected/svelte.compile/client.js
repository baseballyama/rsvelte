import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	ComboBox,
	Dropdown,
	Modal,
	MultiSelect,
	Portal,
	Stack
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ModalWithDropdowns($$anchor) {
	let open = false;

	const contactItems = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" },
		{ id: "3", text: "Teams" },
		{ id: "4", text: "Phone" }
	];

	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Portal(node_1, {
		children: ($$anchor, $$slotProps) => {
			Modal($$anchor, {
				size: 'sm',
				modalHeading: 'Add a contact',
				primaryButtonText: 'Add',
				secondaryButtonText: 'Cancel',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},
				$$events: { 'click:button--secondary': () => open = false },
				children: ($$anchor, $$slotProps) => {
					Stack($$anchor, {
						gap: 4,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							ComboBox(node_2, {
								light: true,
								labelText: 'Contact method',
								placeholder: 'Select contact method',
								get items() {
									return contactItems;
								}
							});

							var node_3 = $.sibling(node_2, 2);

							Dropdown(node_3, {
								labelText: 'Preferred channel',
								selectedId: '0',
								get items() {
									return contactItems;
								}
							});

							var node_4 = $.sibling(node_3, 2);

							MultiSelect(node_4, {
								labelText: 'Notification methods',
								label: 'Select methods...',
								get items() {
									return contactItems;
								}
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}