import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let src = "tutorial/image.gif";
	let name = "Rick Astley";

	$$renderer.push(`<img${$.attr('src', src)} alt="Rick Astley dances."/>`);
}