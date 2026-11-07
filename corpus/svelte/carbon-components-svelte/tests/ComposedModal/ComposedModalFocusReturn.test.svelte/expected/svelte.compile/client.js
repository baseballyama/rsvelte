import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComposedModal from "carbon-components-svelte/ComposedModal/ComposedModal.svelte";
import ModalBody from "carbon-components-svelte/ComposedModal/ModalBody.svelte";
import ModalFooter from "carbon-components-svelte/ComposedModal/ModalFooter.svelte";
import ModalHeader from "carbon-components-svelte/ComposedModal/ModalHeader.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<button type="button">Open Modal</button> <!>`, 1);

export default function ComposedModalFocusReturn_test($$anchor) {
	let open = false;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	ComposedModal(node, {
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ModalHeader(node_1, { title: 'Focus Return Test' });

			var node_2 = $.sibling(node_1, 2);

			ModalBody(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ModalFooter(node_3, { primaryButtonText: 'Save', secondaryButtonText: 'Cancel' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.event('click', button, () => open = true);
	$.append($$anchor, fragment);
}