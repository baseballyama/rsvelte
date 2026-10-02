import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidCopyInputSkeleton from "carbon-components-svelte/CopyInput/FluidCopyInputSkeleton.svelte";

export default function CopyInput_fluidSkeleton_test($$anchor) {
	FluidCopyInputSkeleton($$anchor, { 'data-testid': 'fluid-copy-input-skeleton' });
}