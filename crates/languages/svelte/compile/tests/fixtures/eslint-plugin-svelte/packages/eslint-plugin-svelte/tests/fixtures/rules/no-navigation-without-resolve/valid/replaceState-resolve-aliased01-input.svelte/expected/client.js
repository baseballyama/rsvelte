import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve as alias } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_resolve_aliased01_input($$anchor, $$props) {
	$.push($$props, true);
	replaceState(alias('/foo/'));
	$.pop();
}