import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <button>Click Me</button>`, 1);

export default function Unknown_var01_input($$anchor) {
	const remove = () => {
		unknown.remove();
	};

	var fragment = root();
	var input = $.first_child(fragment);

	$.bind_this(input, ($$value) => unknown = $$value, () => unknown);

	var button = $.sibling(input, 2);

	$.event('click', button, () => remove());
	$.append($$anchor, fragment);
}