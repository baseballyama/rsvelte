import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { set_message } from '../[test_name]/form.remote.ts';

var root = $.from_html(`<form><input/> <input/> <button>set message</button></form>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var form = root();

	$.attribute_effect(form, () => ({ ...set_message }));

	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => set_message.fields.message.as('text')], void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(
		input_1,
		($0) => ({ ...$0 }),
		[
			() => set_message.fields.test_name.as('hidden', 'throwing-error-page')
		],
		void 0,
		void 0,
		void 0,
		true
	);

	var button = $.sibling(input_1, 2);

	$.attribute_effect(button, ($0) => ({ ...$0 }), [() => set_message.fields.action.as('submit', 'normal')]);
	$.reset(form);
	$.append($$anchor, form);
	$.pop();
}