import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	function log(message) {}

	let message = 'Hello World';

	log(message);
}