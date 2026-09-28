import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidTextAreaSkeleton from "carbon-components-svelte/TextArea/FluidTextAreaSkeleton.svelte";

export default function TextArea_fluidSkeleton_test($$anchor) {
	FluidTextAreaSkeleton($$anchor, { 'data-testid': 'fluid-text-area-skeleton' });
}