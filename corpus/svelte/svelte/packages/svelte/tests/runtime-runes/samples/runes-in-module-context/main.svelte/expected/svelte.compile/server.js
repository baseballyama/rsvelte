import * as $ from 'svelte/internal/server';

function createCounter() {
	let count = 0;
	let double = $.derived(() => count * 2);

	return {
		get count() {
			return count;
		},

		set count(value) {
			count = value;
		},

		get double() {
			return double();
		}
	};
}

export default function Main($$renderer) {
	const counter = createCounter();

	$$renderer.push(`<button>${$.escape(counter.double)}</button>`);
}