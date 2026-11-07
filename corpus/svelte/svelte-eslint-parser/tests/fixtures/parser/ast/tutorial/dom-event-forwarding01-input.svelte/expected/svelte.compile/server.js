import * as $ from 'svelte/internal/server';
import CustomButton from './CustomButton.svelte';

export default function Dom_event_forwarding01_input($$renderer) {
	function handleClick() {
		alert('clicked');
	}

	CustomButton($$renderer, {});
}