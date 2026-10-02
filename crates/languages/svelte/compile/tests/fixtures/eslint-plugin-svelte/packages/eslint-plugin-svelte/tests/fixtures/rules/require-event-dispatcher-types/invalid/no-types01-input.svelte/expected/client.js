import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

export default function No_types01_input($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	$.pop();
}