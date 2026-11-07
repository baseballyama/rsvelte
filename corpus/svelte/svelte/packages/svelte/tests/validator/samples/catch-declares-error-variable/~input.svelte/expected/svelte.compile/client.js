import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click to create error</button> `, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let value = null;
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => String(value)]);

	$.event('click', button, (event) => {
		try {
			throw new Error('foo');
		} catch(error) {
			value = error;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}