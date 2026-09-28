import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const arr = [1, 2];

	[arr[0], arr[1]] = [arr[1], arr[0]];
	$$renderer.push(`<p>${$.escape(arr[0])}, ${$.escape(arr[1])}</p>`);
}