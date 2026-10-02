import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-kpclan"></div>`);
var root_1 = $.from_html(`<div class="c svelte-kpclan"></div>`);
var root_2 = $.from_html(`<div class="d svelte-kpclan"></div>`);
var root_3 = $.from_html(`<div class="a svelte-kpclan"></div> <!> <div class="e svelte-kpclan"></div>`, 1);

export default function Input($$anchor) {
	let foo = true;
	let bar = true;
	var fragment = root_3();
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

		var alternate = ($$anchor) => {
			var div_2 = root_2();

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (foo) $$render(consequent); else if (bar) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.next(2);
	$.append($$anchor, fragment);
}