import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox"/>`);

export default function Component2($$anchor, $$props) {
	$.push($$props, true);

	let rows = $.prop($$props, 'rows', 31, () => $.proxy([]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.remove_input_defaults(input);
			$.bind_checked(input, () => rows()[0].check, ($$value) => rows(rows()[0].check = $$value, true));
			$.append($$anchor, input);
		};

		$.if(node, ($$render) => {
			if (rows().length) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}