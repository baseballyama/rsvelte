import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const hi = ($$anchor, a = $.noop, $$arg1) => {
	let b = $.derived_safe_equal(() => $.fallback($$arg1?.(), 2));

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(b)));
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(b) === 'a') $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `${a() ?? ''} `));
	$.append($$anchor, fragment);
};

var root = $.from_html(` <!>`, 1);

export default function Input($$anchor) {
	// @ts-check
	/**
	 * @typedef {'a' | 'b'} TypeA
	*/
	/**@type {TypeA}*/ (
	hi)($$anchor, () => 'c', () => 'd');
}