import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let items = $.state([0]);

	const addItem = () => {
		$.set(items, [...$.get(items), $.get(items).length]);
	};

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => $.get(items).join(', ')]);
	$.event('click', button, addItem);
	$.append($$anchor, button);
}