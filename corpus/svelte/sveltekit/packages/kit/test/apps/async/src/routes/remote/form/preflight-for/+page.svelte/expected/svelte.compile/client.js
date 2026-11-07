import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get_value, set_value } from './form.remote.ts';
import * as v from 'valibot';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p> </p> <form><!> <input/> <button>submit</button></form> <p data-preflight-for-pending=""> </p> <p data-preflight-for-result=""> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const value = get_value();
	const schema = v.object({ value: v.pipe(v.number(), v.maxValue(20, 'too big')) });

	// preflight().for() ordering — the bug: preflight was lost when chained before for
	const form = set_value.preflight(schema).for('a');

	var fragment = root_1();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var form_1 = $.sibling(p, 2);

	$.attribute_effect(form_1, () => ({ 'data-preflight-for': true, ...form }));

	var node = $.child(form_1);

	$.each(node, 17, () => form.fields.value.issues(), $.index, ($$anchor, issue) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1, true);

		$.template_effect(() => $.set_text(text_1, $.get(issue).message));
		$.append($$anchor, p_1);
	});

	var input = $.sibling(node, 2);

	$.attribute_effect(input, ($0) => ({ 'data-preflight-for-input': true, ...$0 }), [() => form.fields.value.as('number')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form_1);

	var p_2 = $.sibling(form_1, 2);
	var text_2 = $.only_child(p_2);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3);

	$.template_effect(() => {
		$.set_text(text, `value.current: ${value.current ?? ''}`);
		$.set_text(text_2, `form.pending: ${form.pending ?? ''}`);
		$.set_text(text_3, `form.result: ${form.result ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
}