import * as $ from 'svelte/internal/server';

function snippet($$renderer) {
	$$renderer.push(`<!---->Hello`);
}

export default function Main($$renderer) {
	function log() {
		// Test that the log function is not hoisted. If it was, this would make the test
		// pass still, but Vitest would error because it sees that there are unhandled errors
		snippet;
	}

	$$renderer.push(`<button>log snippet</button>`);
}