import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function OverflowMenuPreventDefault($$anchor) {
	let copying = false;
	let copied = false;

	async function copyToClipboard() {
		if (copying) return;

		copying = true;
		copied = false;
		await navigator.clipboard.writeText("Sample text to copy");
		copied = true;

		setTimeout(
			() => {
				copied = false;
			},
			2000
		);

		copying = false;
	}

	OverflowMenu($$anchor, {
		size: 'field',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => copied ? "Copied!" : "Copy page");

				OverflowMenuItem(node, {
					get text() {
						return $.get($0);
					},

					get disabled() {
						return copying;
					},

					$$events: {
						click: (e) => {
							// Prevent menu from closing for this item.
							e.preventDefault();

							copyToClipboard();
						}
					}
				});
			}

			var node_1 = $.sibling(node, 2);

			OverflowMenuItem(node_1, { text: 'Close menu' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}