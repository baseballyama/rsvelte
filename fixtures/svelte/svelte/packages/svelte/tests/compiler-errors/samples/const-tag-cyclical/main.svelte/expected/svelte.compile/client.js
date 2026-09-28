import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const a = $.derived(() => b);
			const b = $.derived(() => $.get(a));
			var h1 = root();

			h1.textContent = `hello ${$.get(a) ?? ''}`;
			$.append($$anchor, h1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}