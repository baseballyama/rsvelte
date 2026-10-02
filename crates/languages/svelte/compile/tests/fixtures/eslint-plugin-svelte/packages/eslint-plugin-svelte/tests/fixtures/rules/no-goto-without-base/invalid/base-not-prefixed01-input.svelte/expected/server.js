import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

export default function Base_not_prefixed01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		goto('/foo/' + base);
		goto(`/foo/${base}`);
	});
}