import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>hi</p>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Input($$anchor) {
	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}