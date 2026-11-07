import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal } from "carbon-components-svelte";

var root = $.from_html(`<p>Save your changes to the Cloudant database configuration.</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ModalPrimaryButtonLoading($$anchor) {
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

	var fragment = root_1();
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

	Modal(node_1, {
		modalHeading: 'Save changes',
		primaryButtonText: 'Save',
		secondaryButtonText: 'Cancel',
		get primaryButtonLoading() {
			return saving;
		},
		primaryButtonLoadingDescription: 'Saving...',
		get preventCloseOnClickOutside() {
			return saving;
		},

		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:button--secondary': () => {
				if (!saving) open = false;
			},
			submit: onSave
		},

		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}