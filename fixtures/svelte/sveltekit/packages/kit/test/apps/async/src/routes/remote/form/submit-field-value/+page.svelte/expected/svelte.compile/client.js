import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { my_form } from './form.remote.ts';

var root = $.from_html(`<a href="/remote/form/submit-field-value/page2">Page 2</a> <form><button>1</button> <button>5</button> <button id="no-value" type="submit">no value</button></form> <p id="captured"> </p> <p id="result"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let captured = $.state(null);

	my_form.enhance(async ({ fields, submit }) => {
		// the submit field's value should already reflect the clicked button
		$.set(captured, fields.quantity.value(), true);

		await submit();
	});

	var fragment = root();
	var form = $.sibling($.first_child(fragment), 2);

	$.attribute_effect(form, () => ({ ...my_form }));

	var button = $.child(form);

	$.attribute_effect(button, ($0) => ({ id: 'one', ...$0 }), [() => my_form.fields.quantity.as('submit', 1)]);

	var button_1 = $.sibling(button, 2);

	$.attribute_effect(button_1, ($0) => ({ id: 'five', ...$0 }), [() => my_form.fields.quantity.as('submit', 5)]);
	$.next(2);
	$.reset(form);

	var p = $.sibling(form, 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(() => {
		$.set_text(text, $.get(captured));
		$.set_text(text_1, my_form.result);
	});

	$.append($$anchor, fragment);
	$.pop();
}