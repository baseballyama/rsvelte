import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	let object = {
		toString() {
			return count;
		}
	};

	$$renderer.push(`<button>${$.escape(object)}</button>`);
}