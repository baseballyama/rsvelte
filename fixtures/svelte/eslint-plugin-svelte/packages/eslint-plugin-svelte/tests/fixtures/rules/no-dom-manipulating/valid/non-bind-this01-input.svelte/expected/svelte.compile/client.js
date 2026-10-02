import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <button>Click Me</button>`, 1);

export default function Non_bind_this01_input($$anchor) {
	let foo;
	let bar;

	const remove = () => {
		foo.remove();
		bar.remove();
	};

	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	$.bind_value(input, () => foo, ($$value) => foo = $$value);
	$.event('click', button, () => remove());
	$.append($$anchor, fragment);
}