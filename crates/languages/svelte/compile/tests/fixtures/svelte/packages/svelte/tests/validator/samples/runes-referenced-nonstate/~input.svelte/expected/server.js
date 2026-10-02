import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let a = 1;
	let b = 2;
	let c = 3;
	let d = 4;

	$$renderer.push(`<button>a += 1</button> <button>b += 1</button> <button>c += 1</button> <button>d += 1</button> <p>${$.escape(a)} + ${$.escape(b)} + ${$.escape(c)} = ${$.escape(a + b + c)}</p>`);
}