import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Modal from "carbon-components-svelte/Modal/Modal.svelte";

var root = $.from_html(`<button type="button">Open Modal</button> <!>`, 1);

export default function ModalFocusReturn_test($$anchor) {
	let open = false;
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Modal(node, {
		modalHeading: 'Focus Return Test',
		primaryButtonText: 'Save',
		secondaryButtonText: 'Cancel',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		}
	});

	$.event('click', button, () => open = true);
	$.append($$anchor, fragment);
}