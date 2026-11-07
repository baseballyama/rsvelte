import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser, dev } from '$app/environment';

var root = $.from_html(`<div>DEV</div>`);
var root_1 = $.from_html(`<div></div>`);

export default function Complex_guards02_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();

			div_1.textContent = localStorage.getItem('myCat');
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!browser || !dev) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}