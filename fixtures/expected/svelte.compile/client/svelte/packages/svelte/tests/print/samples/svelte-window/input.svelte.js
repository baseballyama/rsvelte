import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	function handleKeydown(event) {
		alert(`pressed the ${event.key} key`);
	}

	$.event('keydown', $.window, handleKeydown);
}