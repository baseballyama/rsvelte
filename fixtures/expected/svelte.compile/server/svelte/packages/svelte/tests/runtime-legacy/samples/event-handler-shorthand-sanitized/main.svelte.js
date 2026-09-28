import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<button>click me now</button>`);
}