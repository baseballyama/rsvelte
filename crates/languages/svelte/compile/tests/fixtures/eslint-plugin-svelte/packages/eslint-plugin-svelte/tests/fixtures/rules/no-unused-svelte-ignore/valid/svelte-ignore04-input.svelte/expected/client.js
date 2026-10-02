import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_1 = $.from_html(`<div></div> <label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_2 = $.from_html(`<div><!></div> <div><!></div>`, 1);

export default function Svelte_ignore04_input($$anchor) {
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var text = $.text('A');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_1();

			$.next(4);
			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if (true) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.append($$anchor, fragment);
}