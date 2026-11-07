import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>x is greater than 10</p>`);
var root_1 = $.from_html(`<p>x is less than 5</p>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		var consequent_2 = ($$anchor) => {};

		$.if(node, ($$render) => {
			if (x > 10) $$render(consequent); else if (x < 5) $$render(consequent_1, 1); else if (x === 1) $$render(consequent_2, 2);
		});
	}

	$.append($$anchor, fragment);
}