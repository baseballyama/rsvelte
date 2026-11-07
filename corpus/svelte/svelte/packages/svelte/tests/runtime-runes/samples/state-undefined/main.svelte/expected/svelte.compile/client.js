import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let foo = $.state(void 0);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(foo)));
	$.event('click', button, () => $.set(foo, 'foo'));
	$.append($$anchor, button);
}