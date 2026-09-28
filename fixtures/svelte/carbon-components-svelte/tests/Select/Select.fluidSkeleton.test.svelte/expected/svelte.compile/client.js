import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidSelectSkeleton from "carbon-components-svelte/Select/FluidSelectSkeleton.svelte";

export default function Select_fluidSkeleton_test($$anchor) {
	FluidSelectSkeleton($$anchor, { 'data-testid': 'fluid-select-skeleton' });
}