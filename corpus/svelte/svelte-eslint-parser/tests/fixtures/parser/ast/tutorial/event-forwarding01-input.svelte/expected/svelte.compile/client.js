import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Outer from './Outer.svelte';

export default function Event_forwarding01_input($$anchor) {
	function handleMessage(event) {
		alert(event.detail.text);
	}

	Outer($$anchor, { $$events: { message: handleMessage } });
}