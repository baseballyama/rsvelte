import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidNumberInputSkeleton from "carbon-components-svelte/NumberInput/FluidNumberInputSkeleton.svelte";

export default function NumberInput_fluidSkeleton_test($$anchor) {
	FluidNumberInputSkeleton($$anchor, { 'data-testid': 'fluid-number-input-skeleton' });
}