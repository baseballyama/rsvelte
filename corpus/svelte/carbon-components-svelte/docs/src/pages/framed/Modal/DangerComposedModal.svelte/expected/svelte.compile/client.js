import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from "carbon-components-svelte";

var root = $.from_html(`<p>This is a permanent action and cannot be undone.</p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function DangerComposedModal($$anchor, $$props) {
	let open = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		kind: 'danger',
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Delete all');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ComposedModal(node_1, {
		danger: true,
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			open: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			close: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			ModalHeader(node_2, { title: 'Delete all instances' });

			var node_3 = $.sibling(node_2, 2);

			ModalBody(node_3, {
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			ModalFooter(node_4, {
				primaryButtonText: 'Delete',
				secondaryButtonText: 'Cancel',
				danger: true,
				$$events: { submit: () => open = false }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}