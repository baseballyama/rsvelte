import * as $ from 'svelte/internal/server';

export default function Each_blocks01_input($$renderer) {
	let cats = [
		{ id: 'J---aiyznGQ', name: 'Keyboard Cat' },
		{ id: 'z_AbfPXTKms', name: 'Maru' },
		{ id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
	];

	$$renderer.push(`<h1>The Famous Cats of YouTube</h1> <ul><!--[-->`);

	const each_array = $.ensure_array_like(cats);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let cat = each_array[$$index];

		$$renderer.push(`<li><a target="_blank"${$.attr('href', `https://www.youtube.com/watch?v=${$.stringify(cat.id)}`)}>${$.escape(cat.name)}</a></li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}