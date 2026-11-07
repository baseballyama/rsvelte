import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <input/>`, 1);

export default function Ts_event03_input($$anchor, $$props) {
	$.push($$props, true);
	$$props.onfoo({ detail: 1 });

	var fragment = root();
	var button = $.first_child(fragment);
	var input = $.sibling(button, 2);

	$.delegated('click', button, (e) => {
		e.currentTarget;
	});

	$.delegated('input', input, (e) => {
		e.currentTarget;
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'input']);