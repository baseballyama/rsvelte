import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelectSkeleton from "carbon-components-svelte/Select/SelectSkeleton.svelte";

export default function Select_skeleton_test($$anchor) {
	SelectSkeleton($$anchor, { 'data-testid': 'select-skeleton' });
}