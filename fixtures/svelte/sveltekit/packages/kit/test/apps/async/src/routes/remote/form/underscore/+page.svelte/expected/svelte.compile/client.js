import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { register } from './form.remote.ts';

var root = $.from_html(`<form><input/> <input/> <button>submit</button></form> <pre> </pre>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var form = $.first_child(fragment);

	$.attribute_effect(form, () => ({ ...register }), void 0, void 0, void 0, 'svelte-pdr925');

	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => register.fields.username.as('text')], void 0, void 0, 'svelte-pdr925', true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, ($0) => ({ ...$0 }), [() => register.fields._password.as('password')], void 0, void 0, 'svelte-pdr925', true);
	$.next(2);
	$.reset(form);

	var pre = $.sibling(form, 2);
	var text = $.only_child(pre, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(register.fields.issues(), null, '  ')]);
	$.append($$anchor, fragment);
	$.pop();
}