import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_partial_resolve01_input($$anchor, $$props) {
	$.push($$props, true);
	pushState(resolve('/foo') + '/bar');
	pushState('/foo' + resolve('/bar'));
	$.pop();
}