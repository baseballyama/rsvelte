import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_partial_resolve01_input($$anchor, $$props) {
	$.push($$props, true);
	replaceState(resolve('/foo') + '/bar');
	replaceState('/foo' + resolve('/bar'));
	$.pop();
}