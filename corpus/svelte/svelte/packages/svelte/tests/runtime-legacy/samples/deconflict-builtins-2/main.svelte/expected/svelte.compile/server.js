import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo = 'hello world';

	$$renderer.push(`<svg><text>hello world</text></svg>`);
}