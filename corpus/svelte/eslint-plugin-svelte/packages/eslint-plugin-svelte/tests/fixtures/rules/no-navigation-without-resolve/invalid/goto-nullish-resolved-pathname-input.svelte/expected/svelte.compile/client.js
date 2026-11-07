import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

export default function Goto_nullish_resolved_pathname_input($$anchor, $$props) {
	$.push($$props, true);
	goto($$props.one);
	goto($$props.two);
	goto($$props.three);
	$.pop();
}