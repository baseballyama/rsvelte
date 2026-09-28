import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from "carbon-components-svelte";

var root = $.from_html(`<p data-testid="modal-body">Modal content</p> <input type="text" data-modal-primary-focus="" data-testid="modal-primary-focus" aria-label="Primary focus input"/>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<button type="button" data-testid="open-modal">Open modal</button> <p data-testid="close-events"> </p> <!>`, 1);

export default function ComposedModalFixture($$anchor) {
	let open = false;
	let closeEvents = [];
	var fragment = root_2();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);

	ComposedModal(node, {
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			close: (e) => closeEvents = [...closeEvents, e.detail?.trigger ?? "null"]
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			ModalHeader(node_1, { title: 'Modal title' });

			var node_2 = $.sibling(node_1, 2);

			ModalBody(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			ModalFooter(node_3, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						'data-testid': 'close-modal',
						$$events: { click: () => open = false },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Close');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.template_effect(($0) => $.set_text(text, $0), [() => closeEvents.join(",")]);
	$.event('click', button, () => open = true);
	$.append($$anchor, fragment);
}