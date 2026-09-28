import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { submit } from './form.remote.ts';

var root = $.from_html(`<form><button id="requested-submit">Submit</button></form> <p id="form-result"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var form = $.first_child(fragment);

	$.attribute_effect(form, () => ({ ...submit }));

	var p = $.sibling(form, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, submit.result?.message ?? 'not submitted'));
	$.append($$anchor, fragment);
	$.pop();
}