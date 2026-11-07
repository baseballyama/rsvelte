import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label><input type="checkbox"/> big</label> <div> </div>`, 1);

export default function Class_shorthand_input($$anchor) {
	let big = false;
	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var div = $.sibling(label, 2);
	let classes;
	var text = $.only_child(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'svelte-1fg3cps', null, classes, { big });
		$.set_text(text, `some ${big ? 'big' : 'small'} text`);
	});

	$.bind_checked(input, () => big, ($$value) => big = $$value);
	$.append($$anchor, fragment);
}