import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

export default function Goto_resolved_pathname_wrong_module01_input($$anchor, $$props) {
	$.push($$props, true);
	goto($$props.href);
	$.pop();
}