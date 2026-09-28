import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label><input/> arrow up/down</label> <p> </p>`, 1);

export default function Main($$anchor) {
	let value = $.state('1');

	function onkeydown(e) {
		let _v = parseFloat($.get(value));

		if (e.key === 'ArrowUp') _v += 1; else if (e.key === 'ArrowDown') _v -= 1;

		$.set(value, _v.toString(), true);
	}

	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var p = $.sibling(label, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `value = ${$.get(value) ?? ''}`));
	$.delegated('keydown', input, onkeydown);
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, fragment);
}

$.delegate(['keydown']);