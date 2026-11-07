import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	const handlers = { current: increment };

	function increment() {
		count += 1;
	}

	function decrement() {
		count -= 1;
	}

	$$renderer.push(`<button>increment</button> <button>decrement</button> <button>clicks: ${$.escape(count)}</button>`);
}