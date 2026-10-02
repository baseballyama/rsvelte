import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox, Dropdown, Modal, MultiSelect, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<button type="button" data-testid="open-modal">Open modal</button> <p data-testid="notification-ids"> </p> <p data-testid="notification-count"> </p> <!>`, 1);

export default function ModalWithDropdownsFixture($$anchor, $$props) {
	$.push($$props, true);

	let open = false;
	let notificationIds = [];

	const contactItems = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" },
		{ id: "3", text: "Teams" },
		{ id: "4", text: "Phone" }
	];

	var fragment = root_1();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var node = $.sibling(p_1, 2);

	Modal(node, {
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
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					ComboBox(node_1, {
						light: true,
						labelText: 'Contact method',
						placeholder: 'Select contact method',
						get items() {
							return contactItems;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					Dropdown(node_2, {
						labelText: 'Preferred channel',
						selectedId: '0',
						get items() {
							return contactItems;
						}
					});

					var node_3 = $.sibling(node_2, 2);

					MultiSelect(node_3, {
						labelText: 'Notification methods',
						label: 'Select methods...',
						get items() {
							return contactItems;
						},

						get selectedIds() {
							return notificationIds;
						},

						set selectedIds($$value) {
							notificationIds = $$value;
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			$.set_text(text_1, notificationIds.length);
		},
		[() => [...notificationIds].sort().join(",")]
	);

	$.event('click', button, () => open = true);
	$.append($$anchor, fragment);
	$.pop();
}