import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Checkbox,
	ComposedModal,
	ModalBody,
	ModalFooter,
	ModalHeader
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _ButtonComposedModal($$anchor) {
	let open = true;
	let checked = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Review changes');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ComposedModal(node_1, {
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},
		$$events: { submit: () => open = false },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			ModalHeader(node_2, { label: 'Changes', title: 'Confirm changes' });

			var node_3 = $.sibling(node_2, 2);

			ModalBody(node_3, {
				hasForm: true,
				children: ($$anchor, $$slotProps) => {
					Checkbox($$anchor, {
						labelText: 'I have reviewed the changes',
						get checked() {
							return checked;
						},

						set checked($$value) {
							checked = $$value;
						}
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			{
				let $0 = $.derived(() => !checked);

				ModalFooter(node_4, {
					primaryButtonText: 'Proceed',
					get primaryButtonDisabled() {
						return $.get($0);
					},
					secondaryButtons: [{ text: "Cancel" }, { text: "Review" }],
					$$events: {
						'click:button--secondary': ({ detail }) => {
							if (detail.text === "Cancel") open = false;
							if (detail.text === "Review") console.log("Review");
						}
					}
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}