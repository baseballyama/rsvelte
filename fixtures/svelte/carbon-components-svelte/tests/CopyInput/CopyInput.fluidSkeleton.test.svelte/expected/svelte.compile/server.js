import * as $ from 'svelte/internal/server';
import FluidCopyInputSkeleton from "carbon-components-svelte/CopyInput/FluidCopyInputSkeleton.svelte";

export default function CopyInput_fluidSkeleton_test($$renderer) {
	FluidCopyInputSkeleton($$renderer, { 'data-testid': 'fluid-copy-input-skeleton' });
}