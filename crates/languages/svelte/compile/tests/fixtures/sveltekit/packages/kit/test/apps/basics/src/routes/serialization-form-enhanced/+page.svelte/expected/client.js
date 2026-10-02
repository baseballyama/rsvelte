import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';

var root = $.from_html(`<h1> </h1>`);
var root_1 = $.from_html(`<form method="POST"><button type="submit">submit</button></form> <!> <a href="/serialization-basic">To basic form</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();
	var form_1 = $.first_child(fragment);

	$.action(form_1, ($$node) => enhance?.($$node));

	var node = $.sibling(form_1, 2);

	{
		var consequent = ($$anchor) => {
			var h1 = root();
			var text = $.only_child(h1, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => $$props.form?.foo?.bar()]);
			$.append($$anchor, h1);
		};

		$.if(node, ($$render) => {
			if ($$props.form) $$render(consequent);
		});
	}

	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}