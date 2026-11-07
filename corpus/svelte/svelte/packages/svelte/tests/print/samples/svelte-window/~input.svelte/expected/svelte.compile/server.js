import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function handleKeydown(event) {
		alert(`pressed the ${event.key} key`);
	}
}