import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher as ced } from 'svelte';

export default function Import_alias01_input($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = ced();

	$.pop();
}