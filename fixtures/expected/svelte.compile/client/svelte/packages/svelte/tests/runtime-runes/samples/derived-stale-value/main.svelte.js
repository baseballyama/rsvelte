import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	const derived = $.derived(() => Math.floor($.get(count) / 2));
	const derived2 = $.derived(() => $.get(derived) * 2);

	$.user_effect(() => {
		console.log($.get(derived2));
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.event('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, button);
	$.pop();
}