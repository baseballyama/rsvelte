import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidDropdownSkeleton from "carbon-components-svelte/Dropdown/FluidDropdownSkeleton.svelte";

export default function Dropdown_fluidSkeleton_test($$anchor) {
	FluidDropdownSkeleton($$anchor, { 'data-testid': 'fluid-dropdown-skeleton' });
}