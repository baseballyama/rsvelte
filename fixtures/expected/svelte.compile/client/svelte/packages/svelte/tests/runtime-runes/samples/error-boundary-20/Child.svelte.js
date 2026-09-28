import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let clicked = $.state(false);

	function increment() {
		$.set(clicked, true);
		$.update(count);
	}

	$.user_effect(() => {
		if ($.get(clicked)) {
			$.update(count);
		}
	});

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, increment);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);