import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="Input__wrapper"><label class="Input__label"> </label> <input type="number" class="Input__input"/></div>`);

export default function NumberInput($$anchor, $$props) {
	$.push($$props, true);

	let dataTestId = $.prop($$props, 'dataTestId', 3, undefined),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		value = $.prop($$props, 'value', 15),
		id = $.prop($$props, 'id', 3, ''),
		onChange = $.prop($$props, 'onChange', 3, undefined),
		width = $.prop($$props, 'width', 3, undefined);

	var div = root();
	var label_1 = $.child(div);
	var text = $.only_child(label_1, true);
	var input = $.sibling(label_1, 2);

	$.remove_input_defaults(input);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(label_1, 'for', id());
		$.set_text(text, $$props.label);
		$.set_style(input, `width: ${width() ?? ''};`);
		$.set_attribute(input, 'placeholder', placeholder());
		$.set_attribute(input, 'data-test-id', dataTestId());
		$.set_attribute(input, 'id', id());
	});

	$.delegated('change', input, (e) => {
		if (onChange()) {
			/* @ts-ignore TS not supported in Svelte Html */
			onChange()(e.target.value);
		}
	});

	$.bind_value(input, value);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);