import * as $ from 'svelte/internal/server';

export default function LiveCode5666bdf98c2($$renderer) {
	let count = 0;

	$$renderer.push(`<button>You've clicked ${$.escape(count)} times</button>`);
}