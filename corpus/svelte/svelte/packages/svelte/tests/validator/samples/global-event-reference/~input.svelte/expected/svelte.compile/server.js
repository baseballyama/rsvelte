import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let onclick;

	$$renderer.push(`<button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button>`);
}