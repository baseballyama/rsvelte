import * as $ from 'svelte/internal/server';

export default function LiveCode7bf64e1cddc($$renderer) {
	let count = 1;

	$$renderer.push(`<button>You've clicked ${$.escape(count)} times</button>`);
}