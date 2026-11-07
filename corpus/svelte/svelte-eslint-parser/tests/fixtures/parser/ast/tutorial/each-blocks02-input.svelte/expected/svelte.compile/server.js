import * as $ from 'svelte/internal/server';

export default function Each_blocks02_input($$renderer) {
	let cats = [
		{ id: 'J---aiyznGQ', name: 'Keyboard Cat' },
		{ id: 'z_AbfPXTKms', name: 'Maru' },
		{ id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
	];

	$$renderer.push(`<h1>The Famous Cats of YouTube</h1> <ul><!--[-->`);

	const each_array = $.ensure_array_like(cats);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let cat = each_array[i];

		$$renderer.push(`<li><a target="_blank"${$.attr('href', `https://www.youtube.com/watch?v=${$.stringify(cat.id)}`)}>${$.escape(i + 1)}: ${$.escape(cat.name)}</a></li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}