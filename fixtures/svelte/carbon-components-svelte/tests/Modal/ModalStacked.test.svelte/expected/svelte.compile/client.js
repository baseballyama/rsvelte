import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Modal from "carbon-components-svelte/Modal/Modal.svelte";

var root = $.from_html(`<button type="button" data-testid="launch-sibling-modal">Launch sibling modal</button>`);
var root_1 = $.from_html(`<button type="button" data-testid="launch-child-modal">Launch child modal</button> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function ModalStacked_test($$anchor) {
	let siblingOpen = false;
	let childOpen = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Modal(node, {
		open: true,
		modalHeading: 'Modal',
		passiveModal: true,
		'data-testid': 'modal',
		children: ($$anchor, $$slotProps) => {
			var button = root();

			$.event('click', button, () => siblingOpen = true);
			$.append($$anchor, button);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		modalHeading: 'Sibling modal',
		passiveModal: true,
		'data-testid': 'sibling-modal',
		get open() {
			return siblingOpen;
		},

		set open($$value) {
			siblingOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var button_1 = $.first_child(fragment_1);
			var node_2 = $.sibling(button_1, 2);

			Modal(node_2, {
				modalHeading: 'Child modal',
				passiveModal: true,
				'data-testid': 'child-modal',
				get open() {
					return childOpen;
				},

				set open($$value) {
					childOpen = $$value;
				}
			});

			$.event('click', button_1, () => childOpen = true);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}