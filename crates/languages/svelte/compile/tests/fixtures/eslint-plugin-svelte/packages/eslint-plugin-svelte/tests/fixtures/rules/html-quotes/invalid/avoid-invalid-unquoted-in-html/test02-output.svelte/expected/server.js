import * as $ from 'svelte/internal/server';

export default function Test02_output($$renderer) {
	let src = 'tutorial/image.gif';
	let name = 'Rick Astley';

	$$renderer.push(`<img${$.attr('src', src === "foo" ? 'a' : "b")} alt="Rick Astley dances."/>`);
}