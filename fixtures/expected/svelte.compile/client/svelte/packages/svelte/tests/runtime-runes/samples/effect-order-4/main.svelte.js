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
		const doubled = $.get(count) * 2;

		$.user_effect(() => {
			console.log({ count: $.get(count), doubled });
		});
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.delegated('click', button, increment);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);