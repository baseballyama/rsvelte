import * as $ from 'svelte/internal/server';

export default function A11y01_input($$renderer) {
	let src = 'tutorial/image.gif';

	$$renderer.push(`<img${$.attr('src', src)}/>`);
}