import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve as alias } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_resolve_aliased01_input($$anchor, $$props) {
	$.push($$props, true);
	pushState(alias('/foo/'));
	$.pop();
}