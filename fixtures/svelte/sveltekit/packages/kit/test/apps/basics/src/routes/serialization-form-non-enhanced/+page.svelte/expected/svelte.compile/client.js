import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form method="POST"><button type="submit">submit</button></form> <h1> </h1> <a href="/serialization-basic">To basic form</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(h1, true);

	$.next(2);
	$.template_effect(($0) => $.set_text(text, $0), [() => $$props.form?.foo?.bar()]);
	$.append($$anchor, fragment);
	$.pop();
}