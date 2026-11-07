import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form></form> `, 1);

export default function Main($$anchor) {
	let thisBug;
	var fragment = root();
	var form = $.first_child(fragment);

	{
		const Bug = ($$anchor) => {
			$.next();

			var text = $.text('cool');

			$.append($$anchor, text);
		};

		$.bind_this(form, ($$value) => thisBug = $$value, () => thisBug);
	}

	var text_1 = $.sibling(form);

	$.template_effect(() => $.set_text(text_1, ` ${typeof thisBug}`));
	$.append($$anchor, fragment);
}