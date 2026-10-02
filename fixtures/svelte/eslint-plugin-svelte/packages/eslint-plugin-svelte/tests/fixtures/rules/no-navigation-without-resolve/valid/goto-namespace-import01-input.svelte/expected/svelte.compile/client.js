import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as paths from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_namespace_import01_input($$anchor, $$props) {
	$.push($$props, true);
	goto(paths.resolve('/foo/'));
	$.pop();
}