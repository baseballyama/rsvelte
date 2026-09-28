import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from "carbon-components-svelte";

var root = $.from_html(`<p>Save your changes to the Cloudant database configuration.</p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function ComposedModalPrimaryButtonLoading($$anchor) {
	let open = false;
	let saving = false;

	function onSave() {
		saving = true;

		setTimeout(
			() => {
				saving = false;
				open = false;
			},
			2000
		);
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Save changes');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ComposedModal(node_1, {
		get preventCloseOnClickOutside() {
			return saving;
		},

		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},
		$$events: { submit: onSave },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			ModalHeader(node_2, { title: 'Save changes' });

			var node_3 = $.sibling(node_2, 2);

			ModalBody(node_3, {
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			ModalFooter(node_4, {
				primaryButtonText: 'Save',
				secondaryButtonText: 'Cancel',
				get primaryButtonLoading() {
					return saving;
				},
				primaryButtonLoadingDescription: 'Saving...'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}