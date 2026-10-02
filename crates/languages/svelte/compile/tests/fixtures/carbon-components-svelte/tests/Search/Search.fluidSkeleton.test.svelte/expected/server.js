import * as $ from 'svelte/internal/server';
import FluidSearchSkeleton from "carbon-components-svelte/Search/FluidSearchSkeleton.svelte";

export default function Search_fluidSkeleton_test($$renderer) {
	FluidSearchSkeleton($$renderer, { 'data-testid': 'fluid-search-skeleton' });
}