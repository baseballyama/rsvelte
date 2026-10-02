import * as $ from 'svelte/internal/server';
import FluidMultiSelectSkeleton from "carbon-components-svelte/MultiSelect/FluidMultiSelectSkeleton.svelte";

export default function MultiSelect_fluidSkeleton_test($$renderer) {
	FluidMultiSelectSkeleton($$renderer, { 'data-testid': 'fluid-multi-select-skeleton' });
}