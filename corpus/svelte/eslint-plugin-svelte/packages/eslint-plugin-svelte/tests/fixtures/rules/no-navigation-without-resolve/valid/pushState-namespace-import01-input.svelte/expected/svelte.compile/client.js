import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as paths from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_namespace_import01_input($$anchor, $$props) {
	$.push($$props, true);
	pushState(paths.resolve('/foo/'));
	$.pop();
}