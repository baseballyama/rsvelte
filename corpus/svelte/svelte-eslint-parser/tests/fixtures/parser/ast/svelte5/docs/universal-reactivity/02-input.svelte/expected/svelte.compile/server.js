import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	function createCounter() {
		let count = 0;

		function increment() {
			count += 1;
		}

		return {
			get count() {
				return count;
			},
			increment
		};
	}

	const counter = createCounter();

	$$renderer.push(`<button>clicks: ${$.escape(counter.count)}</button>`);
}