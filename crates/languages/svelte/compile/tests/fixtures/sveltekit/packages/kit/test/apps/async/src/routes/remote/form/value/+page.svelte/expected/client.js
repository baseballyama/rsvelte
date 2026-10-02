import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { values } from './value.remote.ts';

var root = $.from_html(`<h1>Remote Form Value Test</h1> <form><label>Leaf: <input/></label> <label>Object Leaf: <input/></label> <label>Object Array 0: <input/></label> <label>Object Array 1: <input/></label> <label>Array 0 Leaf: <input/></label> <label>Array 1 Leaf: <input/></label> <button>Submit</button></form> <h2>Full Form Value</h2> <pre id="full-value"> </pre> <h2>Nested Object Value</h2> <pre id="object-value"> </pre> <h2>Array Value</h2> <pre id="array-value"> </pre>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var form = $.sibling($.first_child(fragment), 2);

	$.attribute_effect(form, () => ({ ...values }));

	var label = $.child(form);
	var input = $.sibling($.child(label));

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => values.fields.leaf.as('text')], void 0, void 0, void 0, true);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.attribute_effect(input_1, ($0) => ({ ...$0 }), [() => values.fields.object.leaf.as('text')], void 0, void 0, void 0, true);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.sibling($.child(label_2));

	$.attribute_effect(input_2, ($0) => ({ ...$0 }), [() => values.fields.object.array[0].as('text')], void 0, void 0, void 0, true);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.sibling($.child(label_3));

	$.attribute_effect(input_3, ($0) => ({ ...$0 }), [() => values.fields.object.array[1].as('text')], void 0, void 0, void 0, true);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var input_4 = $.sibling($.child(label_4));

	$.attribute_effect(input_4, ($0) => ({ ...$0 }), [() => values.fields.array[0].leaf.as('text')], void 0, void 0, void 0, true);
	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var input_5 = $.sibling($.child(label_5));

	$.attribute_effect(input_5, ($0) => ({ ...$0 }), [() => values.fields.array[1].leaf.as('text')], void 0, void 0, void 0, true);
	$.reset(label_5);
	$.next(2);
	$.reset(form);

	var pre = $.sibling(form, 4);
	var text = $.only_child(pre, true);
	var pre_1 = $.sibling(pre, 4);
	var text_1 = $.only_child(pre_1, true);
	var pre_2 = $.sibling(pre_1, 4);
	var text_2 = $.only_child(pre_2, true);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
		},
		[
			() => JSON.stringify(values.fields.value(), null, '  '),
			() => JSON.stringify(values.fields.object.value(), null, '  '),
			() => JSON.stringify(values.fields.array.value(), null, '  ')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}