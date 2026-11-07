import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { replaceState } from '$app/navigation';

export default function ReplaceState_string_prop01_input($$anchor, $$props) {
	$.push($$props, true);
	replaceState($$props.href);
	$.pop();
}