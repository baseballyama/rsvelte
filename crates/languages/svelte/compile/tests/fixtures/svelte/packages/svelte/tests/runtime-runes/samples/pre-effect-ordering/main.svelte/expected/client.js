import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	$.user_pre_effect(() => {
		console.log(`Outer Effect Start (${$.get(count)})`);

		$.user_pre_effect(() => {
			console.log(`Inner Effect (${$.get(count)})`);
		});

		console.log(`Outer Effect End (${$.get(count)})`);
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `Count: ${$.get(count) ?? ''}`));
	$.event('click', button, increment);
	$.append($$anchor, button);
	$.pop();
}