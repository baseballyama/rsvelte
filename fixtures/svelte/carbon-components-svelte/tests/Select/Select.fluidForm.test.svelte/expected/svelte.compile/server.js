import * as $ from 'svelte/internal/server';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import Select from "carbon-components-svelte/Select/Select.svelte";
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";

export default function Select_fluidForm_test($$renderer) {
	FluidForm($$renderer, {
		children: ($$renderer) => {
			Select($$renderer, {
				labelText: 'Fluid form select',
				children: ($$renderer) => {
					SelectItem($$renderer, { value: 'option-1', text: 'Option 1' });
					$$renderer.push(`<!----> `);
					SelectItem($$renderer, { value: 'option-2', text: 'Option 2' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}