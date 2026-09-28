import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	// svelte-ignore non_reactive_update
	let value;

	value = "";
	$$renderer.push(`<!---->${$.escape(value)}`);
}