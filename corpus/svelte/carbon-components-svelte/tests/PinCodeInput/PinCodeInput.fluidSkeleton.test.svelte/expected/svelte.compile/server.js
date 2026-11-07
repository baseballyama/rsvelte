import * as $ from 'svelte/internal/server';
import FluidPinCodeInputSkeleton from "carbon-components-svelte/PinCodeInput/FluidPinCodeInputSkeleton.svelte";

export default function PinCodeInput_fluidSkeleton_test($$renderer) {
	FluidPinCodeInputSkeleton($$renderer, { 'data-testid': 'fluid-pin-code-input-skeleton' });
}