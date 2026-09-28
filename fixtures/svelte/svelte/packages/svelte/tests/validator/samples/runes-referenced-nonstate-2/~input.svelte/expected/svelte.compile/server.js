import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let a = { b: 0 };

	$$renderer.push(`<button>a += 1</button> <p>${$.escape(JSON.stringify(a))} + ${$.escape(a.b)}</p>`);
}