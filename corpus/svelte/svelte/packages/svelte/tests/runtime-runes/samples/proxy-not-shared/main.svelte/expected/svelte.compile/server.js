import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let obj = { count: 0 };
	let a = obj;
	let b = obj;

	$$renderer.push(`<button>${$.escape(a.count)}</button> <button>${$.escape(b.count)}</button>`);
}