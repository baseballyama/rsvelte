import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>if</div>`);
var root_1 = $.from_html(`<div>else if</div>`);

export default function Simple_test01_input($$anchor) {
	let foo = true;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (foo) $$render(consequent); else if (foo) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
}