import * as $ from 'svelte/internal/server';
import MenuItem from "carbon-components-svelte/Menu/MenuItem.svelte";
import MenuButton from "carbon-components-svelte/MenuButton/MenuButton.svelte";

export default function MenuButton_slot_test($$renderer) {
	MenuButton($$renderer, {
		labelText: 'Actions',
		children: ($$renderer) => {
			MenuItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Cut`);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			labelChildren: ($$renderer) => {
				{
					$$renderer.push(`<strong>Custom trigger content</strong>`);
				}
			}
		}
	});
}