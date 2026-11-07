import * as $ from 'svelte/internal/server';
import ComboButton from "carbon-components-svelte/ComboButton/ComboButton.svelte";
import MenuItem from "carbon-components-svelte/Menu/MenuItem.svelte";

export default function ComboButton_slot_test($$renderer) {
	ComboButton($$renderer, {
		labelText: 'Save',
		children: ($$renderer) => {
			MenuItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Save as`);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			labelChildren: ($$renderer) => {
				{
					$$renderer.push(`<strong>Custom label content</strong>`);
				}
			}
		}
	});
}