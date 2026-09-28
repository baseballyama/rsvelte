import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-xa6dd5"></div>`);
var root_1 = $.from_html(`<div class="c svelte-xa6dd5"></div>`);
var root_2 = $.from_html(`<div class="a svelte-xa6dd5"></div> <!> <div class="d svelte-xa6dd5"></div>`, 1);

export default function Input($$anchor) {
	let foo = false;
	let array = [1];
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => array, $.index, ($$anchor, item) => {
				var div_1 = root_1();

				$.append($$anchor, div_1);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (foo) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.next(2);
	$.append($$anchor, fragment);
}