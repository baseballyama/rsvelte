import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>div</p> <button>Click Me</button> <button>Click Me</button>`, 1);

export default function Chain01_input($$anchor, $$props) {
	$.push($$props, true);

	let foo;

	const remove1 = () => {
		foo?.remove();
	};

	const remove2 = () => {
		(foo?.remove)();
	};

	var fragment = root();
	var p = $.first_child(fragment);

	$.bind_this(p, ($$value) => foo = $$value, () => foo);

	var button = $.sibling(p, 2);
	var button_1 = $.sibling(button, 2);

	$.event('click', button, () => remove1());
	$.event('click', button_1, () => remove2());
	$.append($$anchor, fragment);
	$.pop();
}