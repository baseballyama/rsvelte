import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let num = 0;
	let cards = [];

	function click() {
		// updating cards via push should have no effect to the ul,
		// since its being mutated instead of reassigned
		cards.push(num++);
	}

	$$renderer.push(`<button>Click Me</button> ${$.escape(num)} <ul><!--[-->`);

	const each_array = $.ensure_array_like(cards);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let c = each_array[i];

		$$renderer.push(`<li>${$.escape(c)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}