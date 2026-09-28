import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComboButton from "carbon-components-svelte/ComboButton/ComboButton.svelte";
import MenuItem from "carbon-components-svelte/Menu/MenuItem.svelte";

var root = $.from_html(`<strong>Custom label content</strong>`);

export default function ComboButton_slot_test($$anchor) {
	ComboButton($$anchor, {
		labelText: 'Save',
		children: ($$anchor, $$slotProps) => {
			MenuItem($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Save as');

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