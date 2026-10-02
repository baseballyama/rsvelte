import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve as alias } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_resolve_aliased01_input($$anchor, $$props) {
	$.push($$props, true);
	goto(alias('/foo/'));
	$.pop();
}