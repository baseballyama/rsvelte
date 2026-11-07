import * as $ from 'svelte/internal/server';

export default function Event_modifiers_input($$renderer) {
	function handleClick() {
		alert('no more alerts');
	}

	$$renderer.push(`<button>Click me</button>`);
}