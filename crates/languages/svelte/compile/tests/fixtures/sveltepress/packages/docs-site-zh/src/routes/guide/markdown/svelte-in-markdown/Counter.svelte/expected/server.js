import * as $ from 'svelte/internal/server';

export default function Counter($$renderer) {
	let count = 0;

	$$renderer.push(`<button>您点击了 ${$.escape(count)} 次</button>`);
}