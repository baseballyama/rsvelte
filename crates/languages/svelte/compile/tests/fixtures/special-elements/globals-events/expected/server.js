import * as $ from 'svelte/internal/server';

export default function Globals_events($$renderer) {
	function handler(event) {
		console.log(event.type);
	}
	$$renderer.push(`<p>Body</p>`);
}
