import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade, fly } from 'svelte/transition';

var root = $.from_html(`<p>Flies in and out</p>`);
var root_1 = $.from_html(`<label><input type="checkbox"/> visible</label> <!>`, 1);

export default function In_and_out_input($$anchor) {
	let visible = true;
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

			$.transition(1, p, () => fly, () => ({ y: 200, duration: 2000 }));
			$.transition(2, p, () => fade);
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.bind_checked(input, () => visible, ($$value) => visible = $$value);
	$.append($$anchor, fragment);
}