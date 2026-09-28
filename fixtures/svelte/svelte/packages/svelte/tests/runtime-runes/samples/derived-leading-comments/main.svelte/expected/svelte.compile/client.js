import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p> <input/>`, 1);

export default function Main($$anchor) {
	function write(value) {
		return $.set(foo, value);
	}

	// a leading comment on the declaration
	// that spans more than one line
	let foo = $.derived(() => 'x');

	let bar = write('y');

	const ctx = {
		get later() {
			return $.get(later);
		}
	};

	// a leading comment on the declaration
	// that spans more than one line
	let later = $.derived(() => 'LATER');

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var input = $.sibling(p_1, 2);

	$.remove_input_defaults(input);

	$.template_effect(() => {
		$.set_text(text, `${$.get(foo) ?? ''}:${bar ?? ''}`);
		$.set_text(text_1, ctx.later);
	});

	$.bind_value(input, () => $.get(later), ($$value) => $.set(later, $$value));
	$.append($$anchor, fragment);
}