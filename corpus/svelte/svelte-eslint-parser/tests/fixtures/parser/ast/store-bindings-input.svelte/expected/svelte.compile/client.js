import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { name, greeting } from './stores.js';

var root = $.from_html(`<h1> </h1> <input/> <button>Add exclamation mark!</button>`, 1);

export default function Store_bindings_input($$anchor) {
	const $greeting = () => $.store_get(greeting, '$greeting', $$stores);
	const $name = () => $.store_get(name, '$name', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var input = $.sibling(h1, 2);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	$.template_effect(() => $.set_text(text, $greeting()));
	$.bind_value(input, $name, ($$value) => $.store_set(name, $$value));
	$.event('click', button, () => $.store_set(name, $name() + '!'));
	$.append($$anchor, fragment);
	$$cleanup();
}