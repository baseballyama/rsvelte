import * as $ from 'svelte/internal/server';
import FluidNumberInputSkeleton from "carbon-components-svelte/NumberInput/FluidNumberInputSkeleton.svelte";

export default function NumberInput_fluidSkeleton_test($$renderer) {
	FluidNumberInputSkeleton($$renderer, { 'data-testid': 'fluid-number-input-skeleton' });
}