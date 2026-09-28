import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidPinCodeInputSkeleton from "carbon-components-svelte/PinCodeInput/FluidPinCodeInputSkeleton.svelte";

export default function PinCodeInput_fluidSkeleton_test($$anchor) {
	FluidPinCodeInputSkeleton($$anchor, { 'data-testid': 'fluid-pin-code-input-skeleton' });
}