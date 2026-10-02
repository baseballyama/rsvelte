import * as $ from 'svelte/internal/server';

export default function _3_input($$renderer) {
	function handleKeydown(event) {
		alert(`pressed the ${event.key} key`);
	}
}