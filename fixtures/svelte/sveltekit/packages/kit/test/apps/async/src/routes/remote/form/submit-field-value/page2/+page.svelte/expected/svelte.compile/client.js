import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { my_form } from '../form.remote.ts';

var root = $.from_html(`<form><input/> <button id="submit" type="submit">submit</button></form> <p id="captured"> </p> <p id="result"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let captured = $.state(null);

	my_form.enhance(async ({ fields, submit }) => {
		// the submit field's value should already reflect the clicked button
		$.set(captured, fields.quantity.value(), true);

		await submit();
	});

	var fragment = root();
	var form = $.first_child(fragment);

	$.attribute_effect(form, () => ({ ...my_form }));

	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ id: 'input', ...$0 }), [() => my_form.fields.quantity.as('number')], void 0, void 0, void 0, true);
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