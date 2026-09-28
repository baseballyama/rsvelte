import * as $ from 'svelte/internal/server';
import FluidTextInputSkeleton from "carbon-components-svelte/TextInput/FluidTextInputSkeleton.svelte";

export default function TextInput_fluidSkeleton_test($$renderer) {
	FluidTextInputSkeleton($$renderer, { 'data-testid': 'fluid-text-input-skeleton' });
}