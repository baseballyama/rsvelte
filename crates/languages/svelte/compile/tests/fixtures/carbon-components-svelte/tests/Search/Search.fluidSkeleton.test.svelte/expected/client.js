import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidSearchSkeleton from "carbon-components-svelte/Search/FluidSearchSkeleton.svelte";

export default function Search_fluidSkeleton_test($$anchor) {
	FluidSearchSkeleton($$anchor, { 'data-testid': 'fluid-search-skeleton' });
}