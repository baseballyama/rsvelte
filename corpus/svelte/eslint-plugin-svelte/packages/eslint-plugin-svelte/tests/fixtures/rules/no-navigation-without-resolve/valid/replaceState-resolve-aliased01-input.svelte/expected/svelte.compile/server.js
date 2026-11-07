import * as $ from 'svelte/internal/server';
import { resolve as alias } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_resolve_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		replaceState(alias('/foo/'));
	});
}