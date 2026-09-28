import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { reset_id } from './form.remote';

var root = $.from_html(`<p class="error"> </p>`);
var root_1 = $.from_html(`<div id="result"> </div>`);
var root_2 = $.from_html(`<form><input/> <button>submit</button> <button type="reset">reset</button></form> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();
	var form = $.first_child(fragment);

	$.attribute_effect(form, () => ({ ...reset_id }));

	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ id: 'reset', ...$0 }), [() => reset_id.fields.message.as('text')], void 0, void 0, void 0, true);
	$.next(4);
	$.reset(form);

	var node = $.sibling(form, 2);

	$.each(node, 16, () => reset_id.fields.message.issues(), (issue) => issue, ($$anchor, issue) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, issue.message));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var text_1 = $.only_child(div, true);

			$.template_effect(() => $.set_text(text_1, reset_id.result.message));
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if (reset_id.result?.message) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}