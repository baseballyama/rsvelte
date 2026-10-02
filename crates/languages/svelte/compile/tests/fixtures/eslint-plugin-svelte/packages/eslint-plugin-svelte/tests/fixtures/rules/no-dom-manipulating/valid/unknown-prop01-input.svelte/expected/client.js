import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>div</div> <button>Click Me</button>`, 1);

export default function Unknown_prop01_input($$anchor) {
	let div;
	const remove = () => div.unknown = '';
	var fragment = root();
	var div_1 = $.first_child(fragment);

	$.bind_this(div_1, ($$value) => div = $$value, () => div);

	var button = $.sibling(div_1, 2);

	$.event('click', button, () => remove());
	$.append($$anchor, fragment);
}