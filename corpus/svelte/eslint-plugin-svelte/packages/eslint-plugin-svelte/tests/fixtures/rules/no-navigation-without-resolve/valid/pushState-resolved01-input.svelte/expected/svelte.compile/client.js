import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_resolved01_input($$anchor, $$props) {
	$.push($$props, true);

	const value = resolve('/foo/');

	pushState(resolve('/foo/'));
	pushState(value);
	$.pop();
}