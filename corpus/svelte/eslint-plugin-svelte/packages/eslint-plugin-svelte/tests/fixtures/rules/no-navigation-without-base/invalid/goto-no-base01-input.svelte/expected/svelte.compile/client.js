import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

export default function Goto_no_base01_input($$anchor, $$props) {
	$.push($$props, true);

	const value = "/foo";

	goto('/foo');
	goto(value);
	$.pop();
}