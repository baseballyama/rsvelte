import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			let count = 1;
			const doubled = count * 2;
			const label = 'count';
			const format = (value) => `${label}: ${value}`;
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => format(doubled)]);
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}