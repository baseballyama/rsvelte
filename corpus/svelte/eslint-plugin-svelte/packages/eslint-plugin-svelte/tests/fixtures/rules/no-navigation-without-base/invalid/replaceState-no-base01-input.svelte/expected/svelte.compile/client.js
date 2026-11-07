import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { replaceState } from '$app/navigation';

export default function ReplaceState_no_base01_input($$anchor, $$props) {
	$.push($$props, true);

	const value = "/foo";

	replaceState('/foo');
	replaceState(value);
	$.pop();
}