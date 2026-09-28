import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu, ContextMenuDivider, ContextMenuOption } from "carbon-components-svelte";
import Checkmark from "carbon-icons-svelte/lib/Checkmark.svelte";
import Copy from "carbon-icons-svelte/lib/Copy.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div data-centered=""><p>Right click anywhere on this page</p></div>`, 1);

export default function ContextMenuPreventDefault($$anchor) {
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

	var fragment = root_1();
	var node = $.first_child(fragment);

	ContextMenu(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => copied ? "Copied!" : "Copy text");
				let $1 = $.derived(() => copied ? Checkmark : Copy);

				ContextMenuOption(node_1, {
					indented: true,
					get labelText() {
						return $.get($0);
					},

					get icon() {
						return $.get($1);
					},

					get disabled() {
						return copying;
					},

					$$events: {
						click: (e) => {
							e.preventDefault();
							copyToClipboard();
						}
					}
				});
			}

			var node_2 = $.sibling(node_1, 2);

			ContextMenuDivider(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ContextMenuOption(node_3, {
				kind: 'danger',
				labelText: 'Delete item',
				get icon() {
					return TrashCan;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.append($$anchor, fragment);
}