import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let name = { value: 0 };

	$$renderer.push(`<button>${$.escape(name.value)}</button> <button>${$.escape(name.value)}</button>`);
}