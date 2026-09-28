import * as $ from 'svelte/internal/server';
import { Button, InlineNotification, Modal } from "carbon-components-svelte";

export default function ModalPreventClose($$renderer) {
	let open = false;
	let hasUnsavedChanges = true;
	let showWarning = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open modal with unsaved changes`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			modalHeading: 'Edit profile',
			primaryButtonText: 'Save',
			secondaryButtonText: 'Discard changes',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				if (showWarning) {
					$$renderer.push('<!--[0-->');

					InlineNotification($$renderer, {
						kind: 'warning',
						title: 'Unsaved changes',
						subtitle: 'Please save or discard your changes before closing.',
						hideCloseButton: true
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <p>You have unsaved changes. Click "Save" to apply them.</p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}