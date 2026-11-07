import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-1ury8e0"></h1>`);

export default function Only_style01_input($$anchor) {
	let count = 0;
	let name = 'World';
	let items = ['a', 'b', 'c'];

	function add() {
		items.push('d');
	}

	function remove() {
		items.pop();
	}

	var h1 = root();

	h1.textContent = 'World';
	$.append($$anchor, h1);
}