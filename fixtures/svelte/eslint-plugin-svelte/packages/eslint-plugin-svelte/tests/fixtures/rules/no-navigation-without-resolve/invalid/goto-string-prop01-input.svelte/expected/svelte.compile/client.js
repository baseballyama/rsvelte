import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

export default function Goto_string_prop01_input($$anchor, $$props) {
	$.push($$props, true);
	goto($$props.href);
	$.pop();
}