import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, InlineNotification, Modal } from "carbon-components-svelte";

var root = $.from_html(`<!> <p>You have unsaved changes. Click "Save" to apply them.</p>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ModalPreventClose($$anchor) {
	let open = false;
	let hasUnsavedChanges = true;
	let showWarning = false;
	var fragment = root_1();
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

	Modal(node_1, {
		modalHeading: 'Edit profile',
		primaryButtonText: 'Save',
		secondaryButtonText: 'Discard changes',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:button--secondary': () => {
				hasUnsavedChanges = false;
				open = false;
			},

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
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					InlineNotification($$anchor, {
						kind: 'warning',
						title: 'Unsaved changes',
						subtitle: 'Please save or discard your changes before closing.',
						hideCloseButton: true
					});
				};

				$.if(node_2, ($$render) => {
					if (showWarning) $$render(consequent);
				});
			}

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}