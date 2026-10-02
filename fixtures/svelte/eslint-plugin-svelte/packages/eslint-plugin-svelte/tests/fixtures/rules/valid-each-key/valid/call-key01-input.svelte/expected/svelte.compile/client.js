import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Call_key01_input($$anchor) {
	let things = [
		{ id: 1, name: 'apple' },
		{ id: 2, name: 'banana' },
		{ id: 3, name: 'carrot' },
		{ id: 4, name: 'doughnut' },
		{ id: 5, name: 'egg' }
	];

	function fn(thing) {
		return thing.id;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => things, (thing) => fn(thing), ($$anchor, thing) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(thing).name));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}