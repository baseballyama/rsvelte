import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_resolved01_input($$anchor, $$props) {
	$.push($$props, true);

	const value = resolve('/foo/');

	goto(resolve('/foo/'));
	goto(value);
	$.pop();
}