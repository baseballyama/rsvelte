import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidTextInputSkeleton from "carbon-components-svelte/TextInput/FluidTextInputSkeleton.svelte";

export default function TextInput_fluidSkeleton_test($$anchor) {
	FluidTextInputSkeleton($$anchor, { 'data-testid': 'fluid-text-input-skeleton' });
}