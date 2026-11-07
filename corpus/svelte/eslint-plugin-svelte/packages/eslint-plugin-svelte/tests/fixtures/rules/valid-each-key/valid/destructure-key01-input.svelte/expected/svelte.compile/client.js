import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Destructure_key01_input($$anchor) {
	let things = [
		{ id: 1, name: 'apple' },
		{ id: 2, name: 'banana' },
		{ id: 3, name: 'carrot' },
		{ id: 4, name: 'doughnut' },
		{ id: 5, name: 'egg' }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => things, ({ id, name }) => id, ($$anchor, $$item) => {
		let id = () => $.get($$item).id;
		let name = () => $.get($$item).name;

		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, name()));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}