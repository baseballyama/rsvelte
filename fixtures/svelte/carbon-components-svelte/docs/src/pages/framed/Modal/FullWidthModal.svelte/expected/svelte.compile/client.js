import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DataTable, Modal } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function FullWidthModal($$anchor) {
	let open = false;
	var fragment = root();
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

	Modal(node_1, {
		fullWidth: true,
		modalLabel: 'An example of a modal with no padding',
		modalHeading: 'Full Width Modal',
		primaryButtonText: 'Add',
		secondaryButtonText: 'Cancel',
		hasScrollingContent: true,
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},
		$$events: { 'click:button--secondary': () => open = false },
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

	$.append($$anchor, fragment);
}