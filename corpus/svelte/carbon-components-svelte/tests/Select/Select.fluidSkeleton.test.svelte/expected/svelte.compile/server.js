import * as $ from 'svelte/internal/server';
import FluidSelectSkeleton from "carbon-components-svelte/Select/FluidSelectSkeleton.svelte";

export default function Select_fluidSkeleton_test($$renderer) {
	FluidSelectSkeleton($$renderer, { 'data-testid': 'fluid-select-skeleton' });
}