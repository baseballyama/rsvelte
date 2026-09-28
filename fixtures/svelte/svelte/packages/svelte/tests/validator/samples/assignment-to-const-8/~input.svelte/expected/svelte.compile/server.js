import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const arr = [1, 2];

	[arr[0], arr[1] = arr] = [arr[1], arr[0]];
	$$renderer.push(`<!---->${$.escape(arr)}`);
}