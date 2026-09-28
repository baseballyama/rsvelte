import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>too hot!</p>`);
var root_1 = $.from_html(`<p>too cold!</p>`);
var root_2 = $.from_html(`<p>just right!</p>`);

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

		var alternate = ($$anchor) => {
			var p_2 = root_2();

			$.append($$anchor, p_2);
		};

		$.if(node, ($$render) => {
			if (porridge.temperature > 100) $$render(consequent); else if (80 > porridge.temperature) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}