import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { touched_form } from './touched.remote.js';

var root = $.from_html(`<p id="touched-name"> </p> <p id="touched-age"> </p> <button id="set-btn" type="button">set name programmatically</button> <form><label>Name <input/></label> <label>Age <input/></label> <button id="reset-btn" type="reset">Reset</button></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var button = $.sibling(p_1, 2);
	var form = $.sibling(button, 2);

	$.attribute_effect(form, () => ({ ...touched_form }));

	var label = $.child(form);
	var input = $.sibling($.child(label));

	$.attribute_effect(input, ($0) => ({ id: 'name-input', ...$0 }), [() => touched_form.fields.name.as('text')], void 0, void 0, void 0, true);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.attribute_effect(input_1, ($0) => ({ id: 'age-input', ...$0 }), [() => touched_form.fields.age.as('number')], void 0, void 0, void 0, true);
	$.reset(label_1);
	$.next(2);
	$.reset(form);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `Name touched: ${$0 ?? ''}`);
			$.set_text(text_1, `Age touched: ${$1 ?? ''}`);
		},
		[
			() => touched_form.fields.name.touched(),
			() => touched_form.fields.age.touched()
		]
	);

	$.delegated('click', button, () => touched_form.fields.name.set('example'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);