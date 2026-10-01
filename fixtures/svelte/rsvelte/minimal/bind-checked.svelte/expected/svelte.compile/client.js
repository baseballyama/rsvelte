import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Thanks.</p>`);
var root_1 = $.from_html(`<label><input type="checkbox"/> I agree</label> <!>`, 1);

export default function Bind_checked($$anchor) {
	let agreed = $.state(false);
	var fragment = root_1();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var node = $.sibling(label, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(agreed)) $$render(consequent);
		});
	}

	$.bind_checked(input, () => $.get(agreed), ($$value) => $.set(agreed, $$value));
	$.append($$anchor, fragment);
}