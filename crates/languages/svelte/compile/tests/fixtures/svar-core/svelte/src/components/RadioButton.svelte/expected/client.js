import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<span class="svelte-frw14h"> </span>`);
var root_1 = $.from_html(`<div><input type="radio" class="svelte-frw14h"/> <label class="svelte-frw14h"><span class="svelte-frw14h"></span> <!></label></div>`);

export default function RadioButton($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, ""),
		value = $.prop($$props, 'value', 15, ""),
		name = $.prop($$props, 'name', 3, ""),
		inputValue = $.prop($$props, 'inputValue', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		css = $.prop($$props, 'css', 3, "");

	const inputId = $.proxy(getInputId($$props.id));

	function handlerChange(ev) {
		value(ev.target.checked);

		if (value()) $$props.onchange && $$props.onchange({ value: true, inputValue: inputValue() });
	}

	var div = root_1();
	var input = $.child(div);

	$.remove_input_defaults(input);

	var label_1 = $.sibling(input, 2);
	var node = $.sibling($.child(label_1), 2);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, label()));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent);
		});
	}

	$.reset(label_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-radio ${css() ?? ''}`, 'svelte-frw14h');
		$.set_attribute(input, 'id', inputId);
		input.disabled = disabled();
		$.set_attribute(input, 'name', name());
		$.set_value(input, inputValue());
		$.set_checked(input, value());
		$.set_attribute(label_1, 'for', inputId);
	});

	$.delegated('change', input, handlerChange);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);