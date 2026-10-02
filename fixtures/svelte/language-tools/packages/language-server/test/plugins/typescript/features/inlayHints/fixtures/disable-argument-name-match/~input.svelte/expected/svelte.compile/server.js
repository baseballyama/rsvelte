import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function log(message) {}

	let message = 'Hello World';

	log(message);
}