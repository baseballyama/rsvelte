import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_partial_resolve01_input($$anchor, $$props) {
	$.push($$props, true);
	goto(resolve('/foo') + '/bar');
	goto('/foo' + resolve('/bar'));
	$.pop();
}