import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	const onclick = () => count++;

	$$renderer.push(`<button>${$.escape(count)}</button> <button>${$.escape(count)}</button>`);
}