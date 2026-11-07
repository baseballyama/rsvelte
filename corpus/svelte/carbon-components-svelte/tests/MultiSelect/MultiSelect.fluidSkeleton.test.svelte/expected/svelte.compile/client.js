import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidMultiSelectSkeleton from "carbon-components-svelte/MultiSelect/FluidMultiSelectSkeleton.svelte";

export default function MultiSelect_fluidSkeleton_test($$anchor) {
	FluidMultiSelectSkeleton($$anchor, { 'data-testid': 'fluid-multi-select-skeleton' });
}