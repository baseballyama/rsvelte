import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_resolved01_input($$anchor, $$props) {
	$.push($$props, true);

	const value = resolve('/foo/');

	replaceState(resolve('/foo/'));
	replaceState(value);
	$.pop();
}