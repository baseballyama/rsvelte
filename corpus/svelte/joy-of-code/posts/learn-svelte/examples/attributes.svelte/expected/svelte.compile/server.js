import * as $ from 'svelte/internal/server';

export default function Attributes($$renderer) {
	let src = 'https://svelte.dev/tutorial/image.gif';
	let alt = 'Person dancing';

	$$renderer.push(`<div class="container"><img${$.attr('src', src)}${$.attr('alt', alt)}/></div>`);
}