import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <textarea></textarea> <input/> <button> </button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	let value = $.proxy({ value: "" });
	let checked = $.proxy({ checked: false });
	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ type: 'text', ...value }), void 0, void 0, void 0, void 0, true);

	var textarea = $.sibling(input, 2);

	$.remove_textarea_child(textarea);
	$.attribute_effect(textarea, () => ({ ...value }));

	var input_1 = $.sibling(textarea, 2);

	$.attribute_effect(input_1, () => ({ type: 'checkbox', ...checked }), void 0, void 0, void 0, void 0, true);

	var button = $.sibling(input_1, 2);
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);