import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>Hey!</span>`);
var root_1 = $.from_html(`<span>there...</span>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function Input($$anchor) {
	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		var consequent_1 = ($$anchor) => {
			var span_1 = root_1();

			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent); else if (!true) $$render(consequent_1, 1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}