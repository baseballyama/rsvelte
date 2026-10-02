import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_1 = $.from_html(`<div><!></div>`);

export default function Invalid_svelte_ignore01_input($$anchor) {
	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text = $.text('A');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}