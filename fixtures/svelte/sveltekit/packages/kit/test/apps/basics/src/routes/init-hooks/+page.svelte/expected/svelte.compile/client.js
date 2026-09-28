import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <a href="/init-hooks/navigate">navigate</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);

	$.next(2);
	$.template_effect(() => $.set_text(text, $$props.data.did_init_run));
	$.append($$anchor, fragment);
	$.pop();
}