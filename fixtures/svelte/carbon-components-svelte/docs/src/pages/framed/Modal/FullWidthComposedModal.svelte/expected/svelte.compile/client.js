import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	ComposedModal,
	DataTable,
	ModalBody,
	ModalFooter,
	ModalHeader
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function FullWidthComposedModal($$anchor) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open full-width modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ComposedModal(node_1, {
		fullWidth: true,
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			ModalHeader(node_2, {
				label: 'An example of a modal with no padding',
				title: 'Full Width Modal'
			});

			var node_3 = $.sibling(node_2, 2);

			ModalBody(node_3, {
				hasScrollingContent: true,
				children: ($$anchor, $$slotProps) => {
					DataTable($$anchor, {
						headers: [
							{ key: "a", value: "Column A" },
							{ key: "b", value: "Column B" },
							{ key: "c", value: "Column C" }
						],
						rows: [
							{
								id: "1",
								a: "Row 1",
								b: "Row 1",
								c: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
							},

							{
								id: "2",
								a: "Row 2",
								b: "Row 2",
								c: "Nunc dui magna, finibus id tortor sed, aliquet bibendum augue."
							}
						]
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			ModalFooter(node_4, {
				primaryButtonText: 'Add',
				secondaryButtonText: 'Cancel',
				$$events: { 'click:button--secondary': () => open = false }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}