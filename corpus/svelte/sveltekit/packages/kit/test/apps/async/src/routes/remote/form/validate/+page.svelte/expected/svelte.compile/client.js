import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { issue_path_form, my_form, my_form_2, unmount_form } from './form.remote.ts';
import * as v from 'valibot';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<form><input/></form>`);
var root_2 = $.from_html(`<form><!> <input/> <!> <input/> <button>submit</button> <!> <button>submit (imperative validation)</button></form> <button id="trigger-validate">trigger validation</button> <form><input/> <button type="button" id="validate">Validate</button> <pre id="allIssues"> </pre></form> <form><!> <input/> <p data-error=""> </p> <button>submit</button></form> <!> <button id="unmount-then-validate">unmount then validate</button> <p id="unmount-error"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const schema = v.object({
		foo: v.picklist(['a', 'b', 'c']),
		bar: v.picklist(['d', 'e']),
		button: v.literal('submitter')
	});

	const unmount_schema = v.object({ qux: v.picklist(['a', 'b']) });
	let error = $.state(false);
	let mounted = $.state(true);
	let unmount_error = $.state('no error');
	var fragment = root_2();
	var form = $.first_child(fragment);
	var event_handler = () => my_form.validate();
	var event_handler_1 = () => my_form.validate();

	$.attribute_effect(
		form,
		($0) => ({
			id: 'my-form',
			...$0,
			oninput: event_handler,
			onfocusout: event_handler_1
		}),
		[() => my_form.preflight(schema)]
	);

	var node = $.child(form);

	$.each(node, 17, () => my_form.fields.foo.issues(), $.index, ($$anchor, issue) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(issue).message));
		$.append($$anchor, p);
	});

	var input = $.sibling(node, 2);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => my_form.fields.foo.as('text')], void 0, void 0, void 0, true);

	var node_1 = $.sibling(input, 2);

	$.each(node_1, 17, () => my_form.fields.bar.issues(), $.index, ($$anchor, issue) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1, true);

		$.template_effect(() => $.set_text(text_1, $.get(issue).message));
		$.append($$anchor, p_1);
	});

	var input_1 = $.sibling(node_1, 2);

	$.attribute_effect(input_1, ($0) => ({ ...$0 }), [() => my_form.fields.bar.as('text')], void 0, void 0, void 0, true);

	var button = $.sibling(input_1, 2);

	$.attribute_effect(button, ($0) => ({ ...$0 }), [() => my_form.fields.button.as('submit', 'incorrect_value')]);

	var node_2 = $.sibling(button, 2);

	$.each(node_2, 17, () => my_form.fields.button.issues(), $.index, ($$anchor, issue) => {
		var p_2 = root();
		var text_2 = $.only_child(p_2, true);

		$.template_effect(() => $.set_text(text_2, $.get(issue).message));
		$.append($$anchor, p_2);
	});

	var button_1 = $.sibling(node_2, 2);

	$.attribute_effect(button_1, ($0) => ({ ...$0 }), [() => my_form.fields.button.as('submit', 'submitter')]);
	$.reset(form);

	var button_2 = $.sibling(form, 2);
	var form_1 = $.sibling(button_2, 2);

	$.attribute_effect(form_1, () => ({ id: 'issue-path-form', ...issue_path_form }));

	var input_2 = $.child(form_1);

	$.attribute_effect(input_2, ($0) => ({ ...$0 }), [() => issue_path_form.fields.nested.value.as('text')], void 0, void 0, void 0, true);

	var button_3 = $.sibling(input_2, 2);
	var pre = $.sibling(button_3, 2);
	var text_3 = $.only_child(pre, true);

	$.reset(form_1);

	var form_2 = $.sibling(form_1, 2);

	$.attribute_effect(form_2, ($0) => ({ id: 'my-form-2', ...$0 }), [
		() => my_form_2.enhance(async ({ submit }) => {
			$.set(error, false);

			try {
				await submit();
			} catch {
				$.set(error, true);
			}
		})
	]);

	var node_3 = $.child(form_2);

	$.each(node_3, 17, () => my_form_2.fields.baz.issues(), $.index, ($$anchor, issue) => {
		var p_3 = root();
		var text_4 = $.only_child(p_3, true);

		$.template_effect(() => $.set_text(text_4, $.get(issue).message));
		$.append($$anchor, p_3);
	});

	var input_3 = $.sibling(node_3, 2);

	$.attribute_effect(input_3, ($0) => ({ ...$0 }), [() => my_form_2.fields.baz.as('text')], void 0, void 0, void 0, true);

	var p_4 = $.sibling(input_3, 2);
	var text_5 = $.only_child(p_4, true);

	$.next(2);
	$.reset(form_2);

	var node_4 = $.sibling(form_2, 2);

	{
		var consequent = ($$anchor) => {
			var form_3 = root_1();

			$.attribute_effect(form_3, ($0) => ({ id: 'unmount-form', ...$0 }), [() => unmount_form.preflight(unmount_schema)]);

			var input_4 = $.child(form_3);

			$.attribute_effect(input_4, ($0) => ({ ...$0 }), [() => unmount_form.fields.qux.as('text')], void 0, void 0, void 0, true);
			$.reset(form_3);
			$.append($$anchor, form_3);
		};

		$.if(node_4, ($$render) => {
			if ($.get(mounted)) $$render(consequent);
		});
	}

	var button_4 = $.sibling(node_4, 2);
	var p_5 = $.sibling(button_4, 2);
	var text_6 = $.only_child(p_5, true);

	$.template_effect(
		($0) => {
			$.set_text(text_3, $0);
			$.set_text(text_5, $.get(error) ? 'An error occurred' : 'No error');
			$.set_text(text_6, $.get(unmount_error));
		},
		[() => JSON.stringify(issue_path_form.fields.allIssues())]
	);

	$.delegated('click', button_2, () => my_form.validate({ all: true }));
	$.delegated('click', button_3, () => issue_path_form.validate({ all: true }));

	$.delegated('click', button_4, async () => {
		const validated = unmount_form.validate({ all: true });

		$.set(mounted, false);

		try {
			await validated;
		} catch(e) {
			$.set(unmount_error, /** @type {Error} */ e.message, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);