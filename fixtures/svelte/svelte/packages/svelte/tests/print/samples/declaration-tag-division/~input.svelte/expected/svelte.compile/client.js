import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Input($$anchor) {
	let visible = true;
	let total = 10;
	let width = 16;
	let height = 9;
	let divisor = 2;
	let options = {};
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const half = total / 2;
			let derived = $.derived(() => total / 4);
			const member = width / height;
			const call = Math.max(total, 1) / 2;
			const string_then_division = 'ab' / divisor;
			const typed = total / 2;
			const { fallback = total / 2 } = options;
			const regex = /[}]/;
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `5 ${$.get(derived) ?? ''} 1.7777777777777777 5 NaN 5 ${fallback ?? ''} /[}]/`));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}