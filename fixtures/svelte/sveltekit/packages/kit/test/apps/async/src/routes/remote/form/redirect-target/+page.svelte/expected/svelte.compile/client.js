import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { redirectForm } from './form.remote.ts';

var root = $.from_html(`<form><button type="submit">Submit blank</button></form> <form><button type="submit">Submit same</button></form> <form><input type="submit" formtarget="_blank" value="Submit input blank"/></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var form = $.first_child(fragment);

	$.attribute_effect(form, ($0) => ({ ...$0, target: '_blank', 'data-testid': 'form-blank' }), [() => redirectForm.for('blank')]);

	var form_1 = $.sibling(form, 2);

	$.attribute_effect(form_1, ($0) => ({ ...$0, 'data-testid': 'form-same' }), [() => redirectForm.for('same')]);

	var form_2 = $.sibling(form_1, 2);

	$.attribute_effect(form_2, ($0) => ({ ...$0, 'data-testid': 'form-input-blank' }), [() => redirectForm.for('input')]);
	$.append($$anchor, fragment);
	$.pop();
}