import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<g><rect x="20" y="10" width="50" height="50" fill="yellow"></rect></g>`);
var root_1 = $.from_html(`<div>lol</div>`);

export default function Child($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var g = root();

			$.append($$anchor, g);
		};

		var alternate = ($$anchor) => {
			var div = root_1();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}