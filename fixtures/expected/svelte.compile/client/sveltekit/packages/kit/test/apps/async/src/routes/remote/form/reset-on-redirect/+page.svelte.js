import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { redirect_form, reset_form } from './form.remote';

var root = $.from_html(`<form><button>Return</button> <button>Redirect</button></form> <div id="result"> </div> <form><button id="redirect-other">Redirect to another page</button></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var form = $.first_child(fragment);

	$.attribute_effect(form, () => ({ ...reset_form }));

	var button = $.child(form);

	$.attribute_effect(button, ($0) => ({ id: 'return', ...$0 }), [() => reset_form.fields.action.as('submit', 'return')]);

	var button_1 = $.sibling(button, 2);

	$.attribute_effect(button_1, ($0) => ({ id: 'redirect', ...$0 }), [() => reset_form.fields.action.as('submit', 'redirect')]);
	$.reset(form);

	var div = $.sibling(form, 2);
	var text = $.only_child(div, true);
	var form_1 = $.sibling(div, 2);

	$.attribute_effect(form_1, ($0) => ({ ...$0 }), [
		() => redirect_form.enhance(async ({ submit }) => {
			await submit();
			sessionStorage.setItem('submit-resolved-pathname', location.pathname);
		})
	]);

	$.template_effect(() => $.set_text(text, reset_form.result));
	$.append($$anchor, fragment);
	$.pop();
}