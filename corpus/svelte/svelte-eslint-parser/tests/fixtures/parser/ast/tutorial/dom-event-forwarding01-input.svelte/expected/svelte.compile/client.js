import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CustomButton from './CustomButton.svelte';

export default function Dom_event_forwarding01_input($$anchor) {
	function handleClick() {
		alert('clicked');
	}

	CustomButton($$anchor, { $$events: { click: handleClick } });
}