import * as $ from 'svelte/internal/server';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";

export default function Dropdown_fluidForm_test($$renderer) {
	const items = [{ id: "0", text: "Slack" }, { id: "1", text: "Email" }];

	FluidForm($$renderer, {
		children: ($$renderer) => {
			Dropdown($$renderer, {
				id: 'test-dropdown',
				items,
				labelText: 'Fluid form dropdown',
				label: 'Choose a contact method'
			});
		},
		$$slots: { default: true }
	});
}