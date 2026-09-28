import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { create } from './form.remote.ts';
import * as v from 'valibot';

var root = $.from_html(`<p data-failing-issue=""> </p>`);
var root_1 = $.from_html(`<form><input/> <button>submit passing</button></form> <p data-passing-pending=""> </p> <p data-passing-result=""> </p> <hr/> <form><input/> <button>submit failing</button></form> <p data-failing-pending=""> </p> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const passing_schema = v.pipeAsync(v.object({ name: v.string() }), v.checkAsync(
		async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));

			return true;
		},
		'async check failed'
	));

	const failing_schema = v.pipeAsync(v.object({ name: v.string() }), v.checkAsync(
		async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));

			return false;
		},
		'async check failed'
	));

	const passing = create.for('passing');
	const failing = create.for('failing');
	var fragment = root_1();
	var form = $.first_child(fragment);

	$.attribute_effect(form, ($0) => ({ 'data-passing': true, ...$0 }), [() => passing.preflight(passing_schema)]);

	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ ...$0, value: 'test' }), [() => passing.fields.name.as('text')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form);

	var p = $.sibling(form, 2);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var form_1 = $.sibling(p_1, 4);

	$.attribute_effect(form_1, ($0) => ({ 'data-failing': true, ...$0 }), [() => failing.preflight(failing_schema)]);

	var input_1 = $.child(form_1);

	$.attribute_effect(input_1, ($0) => ({ ...$0, value: 'test' }), [() => failing.fields.name.as('text')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form_1);

	var p_2 = $.sibling(form_1, 2);
	var text_2 = $.only_child(p_2);
	var node = $.sibling(p_2, 2);

	$.each(node, 17, () => failing.fields.allIssues(), $.index, ($$anchor, issue) => {
		var p_3 = root();
		var text_3 = $.only_child(p_3, true);

		$.template_effect(() => $.set_text(text_3, $.get(issue).message));
		$.append($$anchor, p_3);
	});

	$.template_effect(() => {
		$.set_text(text, `passing pending: ${passing.pending ?? ''}`);
		$.set_text(text_1, `passing result: ${passing.result ?? ''}`);
		$.set_text(text_2, `failing pending: ${failing.pending ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
}