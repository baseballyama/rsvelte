import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { my_form } from './form.remote.ts';

var root = $.from_html(`<form><button>submit</button></form> <p id="result"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var form = $.first_child(fragment);

	$.attribute_effect(form, () => ({ ...my_form }));

	var button = $.child(form);

	$.attribute_effect(button, ($0) => ({ ...$0 }), [() => my_form.fields.submitter.as('submit', 'hello')]);
	$.reset(form);

	var p = $.sibling(form, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, my_form.result));
	$.append($$anchor, fragment);
	$.pop();
}