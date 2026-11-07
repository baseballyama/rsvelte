import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, ComposedModal, ModalBody, ModalFooter, ModalHeader } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function ComposedModal_1($$anchor) {
	let checked = false;

	ComposedModal($$anchor, {
		open: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ModalHeader(node, { label: 'Changes', title: 'Confirm changes' });

			var node_1 = $.sibling(node, 2);

			ModalBody(node_1, {
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

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => !checked);

				ModalFooter(node_2, {
					primaryButtonText: 'Proceed',
					get primaryButtonDisabled() {
						return $.get($0);
					}
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}