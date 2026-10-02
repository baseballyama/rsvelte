import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";

export default function Dropdown_fluidForm_test($$anchor) {
	const items = [{ id: "0", text: "Slack" }, { id: "1", text: "Email" }];

	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Dropdown($$anchor, {
				id: 'test-dropdown',
				get items() {
					return items;
				},
				labelText: 'Fluid form dropdown',
				label: 'Choose a contact method'
			});
		},
		$$slots: { default: true }
	});
}