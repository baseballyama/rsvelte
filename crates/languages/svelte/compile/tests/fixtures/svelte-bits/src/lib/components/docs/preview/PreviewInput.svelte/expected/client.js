import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="scrubber"><div class="scrubber-track scrubber-track--input"><span class="scrubber-label"> </span> <input class="scrubber-input" type="text"/></div></div>`);

export default function PreviewInput($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		value = $.prop($$props, 'value', 3, ''),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		isDisabled = $.prop($$props, 'isDisabled', 3, false);

	var div = root();
	var div_1 = $.child(div);
	var span = $.child(div_1);
	var text = $.only_child(span, true);
	var input = $.sibling(span, 2);

	$.remove_input_defaults(input);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div_1, 'data-disabled', isDisabled());
		$.set_text(text, title());
		$.set_value(input, value());
		$.set_attribute(input, 'placeholder', placeholder());
		$.set_attribute(input, 'maxlength', $$props.maxlength);
		input.disabled = isDisabled();
		$.set_attribute(input, 'aria-label', title());
	});

	$.delegated('input', input, (e) => $$props.onChange?.(e.target.value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);