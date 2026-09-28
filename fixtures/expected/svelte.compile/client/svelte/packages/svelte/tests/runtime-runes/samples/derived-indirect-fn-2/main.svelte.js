import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let count = $.state(0);
	const doubled = () => $.get(count) * 2;
	const inc = () => $.update(count);
	let double = $.derived(doubled);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(double)));
	$.event('click', button, inc);
	$.append($$anchor, button);
}