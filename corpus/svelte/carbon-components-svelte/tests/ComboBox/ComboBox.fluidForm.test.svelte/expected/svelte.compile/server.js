import * as $ from 'svelte/internal/server';
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";

export default function ComboBox_fluidForm_test($$renderer) {
	const items = [{ id: "0", text: "Slack" }, { id: "1", text: "Email" }];

	FluidForm($$renderer, {
		children: ($$renderer) => {
			ComboBox($$renderer, {
				id: 'test-combobox',
				items,
				labelText: 'Fluid form combobox',
				placeholder: 'Select contact method'
			});
		},
		$$slots: { default: true }
	});
}