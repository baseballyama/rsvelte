import * as $ from 'svelte/internal/server';

export default function Counter($$renderer) {
	let count = 0;

	$$renderer.push(`<button>আপনি ${$.escape(count)} বার ক্লিক করেছেন</button>`);
}