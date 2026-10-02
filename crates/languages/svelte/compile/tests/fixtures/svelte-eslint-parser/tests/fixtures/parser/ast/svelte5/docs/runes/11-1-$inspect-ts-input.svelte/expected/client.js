import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Increment</button> <input/>`, 1);

export default function _1_1_$inspect_ts_input($$anchor) {
	let count = $.state(0);
	let message = $.state("hello");

	;; // will console.log when `count` or `message` change

	var fragment = root();
	var button = $.first_child(fragment);
	var input = $.sibling(button, 2);

	$.remove_input_defaults(input);
	$.delegated('click', button, () => $.update(count));
	$.bind_value(input, () => $.get(message), ($$value) => $.set(message, $$value));
	$.append($$anchor, fragment);
}

$.delegate(['click']);