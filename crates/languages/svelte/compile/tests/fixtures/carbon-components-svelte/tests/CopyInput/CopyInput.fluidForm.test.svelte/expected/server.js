import * as $ from 'svelte/internal/server';
import CopyInput from "carbon-components-svelte/CopyInput/CopyInput.svelte";
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";

export default function CopyInput_fluidForm_test($$renderer) {
	FluidForm($$renderer, {
		children: ($$renderer) => {
			CopyInput($$renderer, {
				labelText: 'Fluid form API token',
				value: 'sk-1234567890abcdef'
			});
		},
		$$slots: { default: true }
	});
}