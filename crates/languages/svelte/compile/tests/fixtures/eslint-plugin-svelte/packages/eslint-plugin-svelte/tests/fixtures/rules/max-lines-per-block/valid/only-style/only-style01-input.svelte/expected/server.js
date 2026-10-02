import * as $ from 'svelte/internal/server';

export default function Only_style01_input($$renderer) {
	let count = 0;
	let name = 'World';
	let items = ['a', 'b', 'c'];

	function add() {
		items.push('d');
	}

	function remove() {
		items.pop();
	}

	$$renderer.push(`<h1 class="svelte-1ury8e0">World</h1>`);
}