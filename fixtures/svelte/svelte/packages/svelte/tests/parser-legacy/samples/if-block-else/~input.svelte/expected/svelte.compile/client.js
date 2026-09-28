import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>foo</p>`);
var root_1 = $.from_html(`<p>not foo</p>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (foo) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}