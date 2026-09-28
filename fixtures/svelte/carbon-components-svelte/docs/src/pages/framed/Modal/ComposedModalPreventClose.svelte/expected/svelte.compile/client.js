import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	ComposedModal,
	InlineNotification,
	ModalBody,
	ModalFooter,
	ModalHeader
} from "carbon-components-svelte";

var root = $.from_html(`<!> <p>You have unsaved changes. Click "Save" to apply them.</p>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function ComposedModalPreventClose($$anchor) {
	let open = false;
	let hasUnsavedChanges = true;
	let showWarning = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: {
			click: () => {
				open = true;
				hasUnsavedChanges = true;
				showWarning = false;
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open modal with unsaved changes');

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

		$$events: {
			close: (e) => {
				console.log("Close triggered by:", e.detail.trigger);

				if (hasUnsavedChanges) {
					e.preventDefault();
					showWarning = true;
				}
			},

			submit: () => {
				hasUnsavedChanges = false;
				open = false;
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			ModalHeader(node_2, { title: 'Edit profile' });

			var node_3 = $.sibling(node_2, 2);

			ModalBody(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							InlineNotification($$anchor, {
								kind: 'warning',
								title: 'Unsaved changes',
								subtitle: 'Please save or discard your changes before closing.',
								hideCloseButton: true
							});
						};

						$.if(node_4, ($$render) => {
							if (showWarning) $$render(consequent);
						});
					}

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_3, 2);

			ModalFooter(node_5, {
				primaryButtonText: 'Save',
				secondaryButtonText: 'Discard changes',
				$$events: {
					'click:button--secondary': () => {
						hasUnsavedChanges = false;
						showWarning = false;
						open = false;
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}