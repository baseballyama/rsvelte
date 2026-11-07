import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <form method="POST"><input name="message"/> <button>submit</button></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);

	$.next(2);
	$.template_effect(() => $.set_text(text, $$props.form?.message ?? $$props.data.message));
	$.append($$anchor, fragment);
	$.pop();
}