import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const cleanup = () => {};

	$$renderer.push(`<button>cleanup</button>`);
}