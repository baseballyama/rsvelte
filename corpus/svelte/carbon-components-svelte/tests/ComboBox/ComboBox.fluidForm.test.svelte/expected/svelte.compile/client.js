import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";

export default function ComboBox_fluidForm_test($$anchor) {
	const items = [{ id: "0", text: "Slack" }, { id: "1", text: "Email" }];

	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			ComboBox($$anchor, {
				id: 'test-combobox',
				get items() {
					return items;
				},
				labelText: 'Fluid form combobox',
				placeholder: 'Select contact method'
			});
		},
		$$slots: { default: true }
	});
}