import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	$$renderer.push(`<h1>Hello ${$.escape(name)}!</h1> <p>${$.escape(a)} + ${$.escape(b)} = ${$.escape(a + b)}.</p>`);
}