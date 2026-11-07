import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';
import { createEventDispatcher } from 'svelte';

export default function Event_forwarding03_input($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	function forward(event) {
		dispatch('message', event.detail);
	}

	Inner($$anchor, { $$events: { message: forward } });
	$.pop();
}