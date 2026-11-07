import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="Input__wrapper"><label class="Input__label"> </label> <input type="file" class="Input__input"/></div>`);

export default function FileInput($$anchor, $$props) {
	$.push($$props, true);

	let accept = $.prop($$props, 'accept', 3, undefined),
		id = $.prop($$props, 'id', 3, '');

	var div = root();
	var label_1 = $.child(div);
	var text = $.only_child(label_1, true);
	var input = $.sibling(label_1, 2);

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(label_1, 'for', id());
		$.set_text(text, $$props.label);
		$.set_attribute(input, 'accept', accept());
		$.set_attribute(input, 'data-test-id', $$props.dataTestId);
		$.set_attribute(input, 'id', id());
	});

	$.delegated('change', input, (e) => $$props.onChange(e.target.files));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);