import * as $ from 'svelte/internal/server';
import FluidTextAreaSkeleton from "carbon-components-svelte/TextArea/FluidTextAreaSkeleton.svelte";

export default function TextArea_fluidSkeleton_test($$renderer) {
	FluidTextAreaSkeleton($$renderer, { 'data-testid': 'fluid-text-area-skeleton' });
}