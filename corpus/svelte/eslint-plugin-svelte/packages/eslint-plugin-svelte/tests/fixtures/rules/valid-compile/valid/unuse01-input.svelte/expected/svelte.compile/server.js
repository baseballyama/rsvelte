import * as $ from 'svelte/internal/server';

export default function Unuse01_input($$renderer) {
	let src = 'tutorial/image.gif';
	let name = 'Rick Astley';

	$$renderer.push(`<input/>`);
}