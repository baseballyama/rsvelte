import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count1 = 0;
	let count2 = 0;
	let cache = {};

	function go() {
		count1++;

		const value = cache.value ??= get_value();
	}

	function get_value() {
		count2++;

		return 42;
	}

	$$renderer.push(`<button>go</button> <p>count1: ${$.escape(count1)}, count2: ${$.escape(count2)}</p>`);
}