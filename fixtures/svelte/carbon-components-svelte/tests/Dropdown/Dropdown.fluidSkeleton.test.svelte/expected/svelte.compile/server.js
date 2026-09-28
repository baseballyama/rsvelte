import * as $ from 'svelte/internal/server';
import FluidDropdownSkeleton from "carbon-components-svelte/Dropdown/FluidDropdownSkeleton.svelte";

export default function Dropdown_fluidSkeleton_test($$renderer) {
	FluidDropdownSkeleton($$renderer, { 'data-testid': 'fluid-dropdown-skeleton' });
}