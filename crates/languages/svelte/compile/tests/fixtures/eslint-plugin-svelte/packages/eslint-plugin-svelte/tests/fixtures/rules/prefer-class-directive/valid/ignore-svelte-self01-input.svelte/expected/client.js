import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Ignore_svelte_self01_input($$anchor) {
	let foo = Math.random();
	let current = 'foo';
	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			Ignore_svelte_self01_input(node_1, { class: current === 'foo' ? 'selected' : '' });
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (foo > 0.5) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}