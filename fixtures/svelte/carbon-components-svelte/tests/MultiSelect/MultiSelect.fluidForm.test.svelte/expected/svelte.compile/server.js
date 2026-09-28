import * as $ from 'svelte/internal/server';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

export default function MultiSelect_fluidForm_test($$renderer) {
	const items = [{ id: "0", text: "Slack" }, { id: "1", text: "Email" }];

	FluidForm($$renderer, {
		children: ($$renderer) => {
			MultiSelect($$renderer, {
				id: 'test-multiselect',
				items,
				labelText: 'Fluid form multi-select',
				label: 'Select contact methods...'
			});
		},
		$$slots: { default: true }
	});
}