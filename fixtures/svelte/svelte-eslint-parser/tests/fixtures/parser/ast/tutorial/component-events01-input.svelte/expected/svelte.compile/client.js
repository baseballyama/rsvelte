import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

export default function Component_events01_input($$anchor) {
	function handleMessage(event) {
		alert(event.detail.text);
	}

	Inner($$anchor, { $$events: { message: handleMessage } });
}