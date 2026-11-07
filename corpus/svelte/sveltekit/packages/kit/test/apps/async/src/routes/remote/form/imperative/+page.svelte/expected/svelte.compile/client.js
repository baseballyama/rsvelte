import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { set_message } from '../[test_name]/form.remote.js';
import * as v from 'valibot';

var root = $.from_html(`<form><label><span>Message</span> <input/> <input/></label> <p id="issue"> </p> <p id="value"> </p> <button id="set-and-validate" type="button">Set & validate</button> <button>Submit</button></form>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const schema = v.object({
		test_name: v.string(),
		message: v.picklist(
			[
				'hello',
				'goodbye',
				'unexpected error',
				'expected error',
				'redirect'
			],
			'message is invalid'
		)
	});

	var form = root();

	$.attribute_effect(form, ($0) => ({ ...$0 }), [() => set_message.preflight(schema)]);

	var label = $.child(form);
	var input = $.sibling($.child(label), 2);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => set_message.fields.message.as('text')], void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(
		input_1,
		($0) => ({ ...$0 }),
		[
			() => set_message.fields.test_name.as('hidden', 'imperative')
		],
		void 0,
		void 0,
		void 0,
		true
	);

	$.reset(label);

	var p = $.sibling(label, 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var button = $.sibling(p_1, 2);

	$.next(2);
	$.reset(form);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => set_message.fields.message.issues()?.[0]?.message ?? 'ok',
			() => set_message.fields.message.value()
		]
	);

	$.delegated('click', button, async () => {
		set_message.fields.message.set('hello');
		await set_message.validate({ all: true });
	});

	$.append($$anchor, form);
	$.pop();
}

$.delegate(['click']);