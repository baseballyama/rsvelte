import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <a href="/serialization-basic/child">child page</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);

	$.next(2);
	$.template_effect(($0) => $.set_text(text, $0), [() => $$props.data.foo.bar()]);
	$.append($$anchor, fragment);
	$.pop();
}