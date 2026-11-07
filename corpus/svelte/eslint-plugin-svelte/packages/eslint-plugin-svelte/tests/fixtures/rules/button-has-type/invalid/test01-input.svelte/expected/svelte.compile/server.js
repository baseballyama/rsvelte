import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	$$renderer.push(`<button>Hello World</button> <button type="">Hello World</button> <button type="">Hello World</button> <button type="foo">Hello World</button>`);
}