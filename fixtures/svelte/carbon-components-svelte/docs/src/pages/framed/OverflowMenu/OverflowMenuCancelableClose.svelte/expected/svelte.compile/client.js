import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function OverflowMenuCancelableClose($$anchor) {
	let emailEnabled = false;
	let smsEnabled = false;
	let saved = true;

	function toggle(setter) {
		return (e) => {
			// Keep the menu open while editing settings.
			e.preventDefault();

			setter();
			saved = false;
		};
	}

	OverflowMenu($$anchor, {
		$$events: {
			close: (e) => {
				// Guard against accidentally dismissing unsaved changes.
				if (!saved && !window.confirm("Discard unsaved notification settings?")) {
					e.preventDefault();
				}
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);
			var event_handler = $.derived(() => toggle(() => emailEnabled = !emailEnabled));

			{
				let $0 = $.derived(() => emailEnabled ? 'On' : 'Off');

				OverflowMenuItem(node, {
					get text() {
						return `Email alerts: ${$.get($0) ?? ''}`;
					},

					$$events: {
						click: function (...$$args) {
							$.get(event_handler)?.apply(this, $$args);
						}
					}
				});
			}

			var node_1 = $.sibling(node, 2);
			var event_handler_1 = $.derived(() => toggle(() => smsEnabled = !smsEnabled));

			{
				let $0 = $.derived(() => smsEnabled ? 'On' : 'Off');

				OverflowMenuItem(node_1, {
					get text() {
						return `SMS alerts: ${$.get($0) ?? ''}`;
					},

					$$events: {
						click: function (...$$args) {
							$.get(event_handler_1)?.apply(this, $$args);
						}
					}
				});
			}

			var node_2 = $.sibling(node_1, 2);

			OverflowMenuItem(node_2, {
				hasDivider: true,
				text: 'Save changes',
				$$events: {
					click: () => {
						// Allow the menu to close after saving.
						saved = true;
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}