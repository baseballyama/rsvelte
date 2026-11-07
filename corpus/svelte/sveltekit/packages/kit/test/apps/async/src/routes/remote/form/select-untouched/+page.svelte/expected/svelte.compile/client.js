import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { myform } from './form.remote.ts';

var root = $.from_html(`<form><input/> <select><option>one</option><option>two</option><option>three</option></select> <button>submit</button></form>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var form = root();

	$.attribute_effect(form, () => ({ ...myform }));

	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => myform.fields.message.as('text')], void 0, void 0, void 0, true);

	var select = $.sibling(input, 2);

	$.attribute_effect(select, ($0) => ({ ...$0 }), [() => myform.fields.number.as('select')]);
	$.next(2);
	$.reset(form);
	$.append($$anchor, form);
	$.pop();
}