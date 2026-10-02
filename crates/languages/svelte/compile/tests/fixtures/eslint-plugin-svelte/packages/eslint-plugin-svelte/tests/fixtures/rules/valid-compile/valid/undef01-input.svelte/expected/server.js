import * as $ from 'svelte/internal/server';

export default function Undef01_input($$renderer) {
	let name = 'Rick Astley';

	$$renderer.push(`<img${$.attr('src', src)} alt="Rick Astley dances."/>`);
}