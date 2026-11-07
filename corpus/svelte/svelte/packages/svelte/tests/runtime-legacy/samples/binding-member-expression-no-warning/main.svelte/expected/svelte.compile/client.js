import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <p> </p>`, 1);

export default function Main($$anchor) {
	let object = { value: 'hello' };
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var p = $.sibling(input, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, object.value));
	$.bind_value(input, () => object.value, ($$value) => object.value = $$value);
	$.append($$anchor, fragment);
}