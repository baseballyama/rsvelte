import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';

export default function _1_untrack_input($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		// this will run when `a` changes,
		// but not when `b` changes
		console.log($$props.a);

		console.log(untrack(() => $$props.b));
	});

	$.pop();
}