import * as $ from 'svelte/internal/server';
import { resolve as alias } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_resolve_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		pushState(alias('/foo/'));
	});
}