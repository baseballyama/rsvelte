import * as $ from 'svelte/internal/server';
import { resolve as alias } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_resolve_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		goto(alias('/foo/'));
	});
}