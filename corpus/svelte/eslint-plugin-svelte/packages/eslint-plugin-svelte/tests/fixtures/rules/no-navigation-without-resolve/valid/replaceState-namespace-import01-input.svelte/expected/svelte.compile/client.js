import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as paths from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_namespace_import01_input($$anchor, $$props) {
	$.push($$props, true);
	replaceState(paths.resolve('/foo/'));
	$.pop();
}