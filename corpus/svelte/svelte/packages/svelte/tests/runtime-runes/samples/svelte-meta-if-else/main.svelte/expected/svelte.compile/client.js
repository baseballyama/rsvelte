import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>during</p>`);
var root_1 = $.from_html(`<p>before</p> <!> <p>after</p>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var consequent_1 = ($$anchor) => {
			var p_1 = root();

			$.append($$anchor, p_1);
		};

		var consequent_2 = ($$anchor) => {
			var p_2 = root();

			$.append($$anchor, p_2);
		};

		$.if(node, ($$render) => {
			if (false) $$render(consequent); else if (true) $$render(consequent_1, 1); else if (false) $$render(consequent_2, 2);
		});
	}

	$.next(2);
	$.append($$anchor, fragment);
}