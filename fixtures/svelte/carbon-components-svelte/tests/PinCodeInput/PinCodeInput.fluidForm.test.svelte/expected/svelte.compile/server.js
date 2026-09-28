import * as $ from 'svelte/internal/server';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import PinCodeInput from "carbon-components-svelte/PinCodeInput/PinCodeInput.svelte";

export default function PinCodeInput_fluidForm_test($$renderer) {
	FluidForm($$renderer, {
		children: ($$renderer) => {
			PinCodeInput($$renderer, { labelText: 'Fluid form pin code' });
		},
		$$slots: { default: true }
	});
}