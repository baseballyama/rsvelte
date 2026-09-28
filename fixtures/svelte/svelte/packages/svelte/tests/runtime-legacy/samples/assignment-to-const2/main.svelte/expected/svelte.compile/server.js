import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const a = 100;
	const arr = [{ a: 1 }, 2];

	[arr[0].a, arr[1] = a] = [arr[1]];
	$$renderer.push(`<p>${$.escape(JSON.stringify(arr))}</p>`);
}