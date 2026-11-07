import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MenuItem from "carbon-components-svelte/Menu/MenuItem.svelte";
import MenuButton from "carbon-components-svelte/MenuButton/MenuButton.svelte";

var root = $.from_html(`<strong>Custom trigger content</strong>`);

export default function MenuButton_slot_test($$anchor) {
	MenuButton($$anchor, {
		labelText: 'Actions',
		children: ($$anchor, $$slotProps) => {
			MenuItem($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Cut');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			labelChildren: ($$anchor, $$slotProps) => {
				var strong = root();

				$.append($$anchor, strong);
			}
		}
	});
}