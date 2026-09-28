import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form><input/></form>`);
var root_1 = $.from_html(`<div><form><!></form></div>`);

export default function Input($$anchor) {
	var div = root_1();
	var form = $.child(div);
	var node = $.child(form);

	{
		var consequent = ($$anchor) => {
			var form_1 = root();

			$.append($$anchor, form_1);
		};

		$.if(node, ($$render) => {
			if (foo) $$render(consequent);
		});
	}

	$.reset(form);
	$.reset(div);
	$.append($$anchor, div);
}