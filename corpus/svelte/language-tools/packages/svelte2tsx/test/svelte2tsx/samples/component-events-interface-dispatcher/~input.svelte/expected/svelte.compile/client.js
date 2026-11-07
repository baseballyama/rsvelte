import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * Some *doc*
	 */
	const dispatch = createEventDispatcher();

	$.pop();
}