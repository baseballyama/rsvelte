import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function increment(...args) {
		count += args.length;
	}

	$$renderer.push(`<button>${$.escape(count)}</button>`);
}