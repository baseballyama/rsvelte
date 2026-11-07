import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<input/> <p> </p> <textarea></textarea> <div contenteditable="true"></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $name = () => $.store_get(name, '$name', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const name = writable('world');
	var $$exports = { name };
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var p = $.sibling(input, 2);
	var text = $.only_child(p);
	var textarea = $.sibling(p, 2);

	$.remove_textarea_child(textarea);

	var div = $.sibling(textarea, 2);

	$.template_effect(() => $.set_text(text, `hello ${$name() ?? ''}`));
	$.bind_value(input, $name, ($$value) => $.store_set(name, $$value));
	$.bind_value(textarea, $name, ($$value) => $.store_set(name, $$value));
	$.bind_content_editable('innerHTML', div, $name, ($$value) => $.store_set(name, $$value));
	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}