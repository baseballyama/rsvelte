import * as $ from 'svelte/internal/server';
import SelectSkeleton from "carbon-components-svelte/Select/SelectSkeleton.svelte";

export default function Select_skeleton_test($$renderer) {
	SelectSkeleton($$renderer, { 'data-testid': 'select-skeleton' });
}