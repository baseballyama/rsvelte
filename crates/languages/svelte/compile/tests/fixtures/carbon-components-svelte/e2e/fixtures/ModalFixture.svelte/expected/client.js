import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal } from "carbon-components-svelte";

var root = $.from_html(`<p data-testid="modal-body">Modal content</p> <button type="button" data-testid="close-modal-programmatic">Close programmatically</button>`, 1);
var root_1 = $.from_html(`<button type="button" data-testid="open-modal">Open modal</button> <p data-testid="events"> </p> <p data-testid="close-events"> </p> <!>`, 1);

export default function ModalFixture($$anchor) {
	let open = false;
	let events = [];
	let closeEvents = [];
	var fragment = root_1();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var node = $.sibling(p_1, 2);

	Modal(node, {
		'data-testid': 'modal',
		modalHeading: 'Modal title',
		primaryButtonText: 'Save',
		secondaryButtonText: 'Cancel',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:button--primary': () => events = [...events, "primary"],
			'click:button--secondary': () => events = [...events, "secondary"],
			close: (e) => closeEvents = [...closeEvents, e.detail?.trigger ?? "null"]
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var button_1 = $.sibling($.first_child(fragment_1), 2);

			$.event('click', button_1, () => open = false);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[() => events.join(","), () => closeEvents.join(",")]
	);

	$.event('click', button, () => open = true);
	$.append($$anchor, fragment);
}