import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

export default function MultiSelect_fluidForm_test($$anchor) {
	const items = [{ id: "0", text: "Slack" }, { id: "1", text: "Email" }];

	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			MultiSelect($$anchor, {
				id: 'test-multiselect',
				get items() {
					return items;
				},
				labelText: 'Fluid form multi-select',
				label: 'Select contact methods...'
			});
		},
		$$slots: { default: true }
	});
}