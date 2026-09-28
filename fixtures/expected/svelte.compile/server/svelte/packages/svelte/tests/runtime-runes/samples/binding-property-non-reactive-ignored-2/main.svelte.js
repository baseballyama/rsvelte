import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let arr = [];

	$$renderer.push(`<input${$.attr('value', arr[0])}/>`);
}