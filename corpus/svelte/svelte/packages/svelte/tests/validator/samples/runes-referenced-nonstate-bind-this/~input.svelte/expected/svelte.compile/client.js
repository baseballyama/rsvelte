import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);
var root_1 = $.from_html(`<div></div> <!>`, 1);

export default function Input($$anchor) {
	let no_need;
	let does_need1;
	let does_need2 = $.state(void 0);
	var fragment = root_1();
	var div = $.first_child(fragment);

	$.bind_this(div, ($$value) => no_need = $$value, () => no_need);

	var node = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var div_1 = $.first_child(fragment_1);

			$.bind_this(div_1, ($$value) => does_need1 = $$value, () => does_need1);

			var div_2 = $.sibling(div_1, 2);

			$.bind_this(div_2, ($$value) => $.set(does_need2, $$value), () => $.get(does_need2));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}