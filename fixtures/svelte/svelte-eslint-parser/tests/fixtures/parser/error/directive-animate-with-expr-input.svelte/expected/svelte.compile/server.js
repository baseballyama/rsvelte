import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';

export default function Directive_animate_with_expr_input($$renderer) {
	const foo = { flip };
	let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	function shuffle() {
		let currentIndex = list.length;

		while (currentIndex != 0) {
			const randomIndex = Math.floor(Math.random() * currentIndex);

			currentIndex--;
			[list[currentIndex], list[randomIndex]] = [list[randomIndex], list[currentIndex]];
		}
	}

	$$renderer.push(`<button>Shuffle</button> <!--[-->`);

	const each_array = $.ensure_array_like(list);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let item = each_array[index];

		$$renderer.push(`<li>${$.escape(item)}</li>`);
	}

	$$renderer.push(`<!--]-->`);
}