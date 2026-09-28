import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let array = [1, 2, 3];

	function addToArray() {
		array.push(array.length + 1);
	}

	$$renderer.push(`<button>add</button> <span>${$.escape(array)}</span>`);
}