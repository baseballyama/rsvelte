import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComposedModal from "carbon-components-svelte/ComposedModal/ComposedModal.svelte";
import ModalHeader from "carbon-components-svelte/ComposedModal/ModalHeader.svelte";

var root = $.from_html(`<!> <button type="button" data-testid="launch-sibling-modal">Launch sibling modal</button>`, 1);
var root_1 = $.from_html(`<!> <button type="button" data-testid="launch-child-modal">Launch child modal</button> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function ComposedModalStacked_test($$anchor) {
	let siblingOpen = false;
	let childOpen = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	ComposedModal(node, {
		open: true,
		'data-testid': 'modal',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ModalHeader(node_1, { title: 'Modal' });

			var button = $.sibling(node_1, 2);

			$.event('click', button, () => siblingOpen = true);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	ComposedModal(node_2, {
		'data-testid': 'sibling-modal',
		get open() {
			return siblingOpen;
		},

		set open($$value) {
			siblingOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			ModalHeader(node_3, { title: 'Sibling modal' });

			var button_1 = $.sibling(node_3, 2);
			var node_4 = $.sibling(button_1, 2);

			ComposedModal(node_4, {
				'data-testid': 'child-modal',
				get open() {
					return childOpen;
				},

				set open($$value) {
					childOpen = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					ModalHeader($$anchor, { title: 'Child modal' });
				},
				$$slots: { default: true }
			});

			$.event('click', button_1, () => childOpen = true);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}