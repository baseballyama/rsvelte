import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-14qxl6w"></div>`);
var root_1 = $.from_html(`<div class="c svelte-14qxl6w"></div>`);
var root_2 = $.from_html(`<div class="a svelte-14qxl6w"></div> <!> <div class="d svelte-14qxl6w"></div>`, 1);

export default function Input($$anchor) {
	let foo = true;
	let bar = true;
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

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
			if (foo) $$render(consequent); else if (bar) $$render(consequent_1, 1);
		});
	}

	$.next(2);
	$.append($$anchor, fragment);
}