import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let open = true;

	$$renderer.push(`<details${$.attr('open', open, true)}><summary>Details</summary> ...</details>`);
}