import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let x = $.state(0);
	let y = $.state(0);

	$.user_pre_effect(() => {
		console.log($.get(x));
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1, true);

	$.template_effect(() => {
		$.set_text(text, $.get(x));
		$.set_text(text_1, $.get(y));
	});

	$.event('click', button, () => $.update(x));
	$.event('click', button_1, () => $.update(y));
	$.append($$anchor, fragment);
	$.pop();
}