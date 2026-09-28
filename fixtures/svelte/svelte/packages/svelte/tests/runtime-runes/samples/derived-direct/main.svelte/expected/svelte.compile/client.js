import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let count = $.state(0);
	let double = $.derived(() => $.get(count) * 2);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(double)));
	$.event('click', button, () => $.update(count));
	$.append($$anchor, button);
}