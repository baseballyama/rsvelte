import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import PinCodeInput from "carbon-components-svelte/PinCodeInput/PinCodeInput.svelte";

export default function PinCodeInput_fluidForm_test($$anchor) {
	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			PinCodeInput($$anchor, { labelText: 'Fluid form pin code' });
		},
		$$slots: { default: true }
	});
}