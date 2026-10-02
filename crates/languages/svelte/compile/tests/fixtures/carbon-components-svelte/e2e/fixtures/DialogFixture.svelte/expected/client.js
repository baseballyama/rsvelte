import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog } from "carbon-components-svelte";

var root = $.from_html(`<p>Modal content</p> <button type="button" data-testid="modal-focus-target">Focus target</button> <form method="dialog"><button type="submit" data-testid="modal-close-button">Close</button></form>`, 1);
var root_1 = $.from_html(`<p>Non-modal content</p>`);
var root_2 = $.from_html(`<button type="button" data-testid="open-modal">Open modal dialog</button> <div data-testid="modal-open-count"> </div> <div data-testid="modal-close-count"> </div> <div data-testid="modal-close-trigger"> </div> <!> <button type="button" data-testid="open-non-modal">Open non-modal dialog</button> <button type="button" data-testid="outside-button">Outside button</button> <!>`, 1);

export default function DialogFixture($$anchor) {
	let modalOpen = false;
	let modalOpenCount = 0;
	let modalCloseCount = 0;

	/** @type {string | null} */
	let modalCloseTrigger = null;

	let nonModalOpen = false;
	var fragment = root_2();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2, true);
	var node = $.sibling(div_2, 2);

	Dialog(node, {
		modal: true,
		'aria-label': 'Modal dialog',
		'data-testid': 'modal-dialog',
		get open() {
			return modalOpen;
		},

		set open($$value) {
			modalOpen = $$value;
		},

		$$events: {
			open: () => modalOpenCount += 1,
			close: (e) => {
				modalCloseCount += 1;
				modalCloseTrigger = e.detail.trigger;
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(4);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var button_1 = $.sibling(node, 2);
	var node_1 = $.sibling(button_1, 4);

	Dialog(node_1, {
		'aria-label': 'Non-modal dialog',
		'data-testid': 'non-modal-dialog',
		get open() {
			return nonModalOpen;
		},

		set open($$value) {
			nonModalOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var p = root_1();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.template_effect(() => {
		$.set_text(text, modalOpenCount);
		$.set_text(text_1, modalCloseCount);
		$.set_text(text_2, modalCloseTrigger ?? "");
	});

	$.event('click', button, () => modalOpen = true);
	$.event('click', button_1, () => nonModalOpen = true);
	$.append($$anchor, fragment);
}