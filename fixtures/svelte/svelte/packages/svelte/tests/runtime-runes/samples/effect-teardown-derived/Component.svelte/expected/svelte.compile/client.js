import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <button disabled="">update</button>`, 1);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let message = $.prop($$props, 'message', 7),
		count = $.prop($$props, 'count', 7);

	$.user_effect(() => () => {
		console.log(count(), message());
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);

	$.template_effect(() => $.set_text(text, count()));

	$.delegated('click', button, () => {
		count(count() + 1);
		message(message() + '!');
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);