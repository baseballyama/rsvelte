import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';

var root = $.from_html(`<p id="result"> </p> <form method="POST"><input type="hidden" name="input" value="hello"/> <button>submit</button></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var form_1 = $.sibling(p, 2);

	$.action(form_1, ($$node) => enhance?.($$node));
	$.template_effect(() => $.set_text(text, $$props.form?.result ?? ''));
	$.append($$anchor, fragment);
	$.pop();
}