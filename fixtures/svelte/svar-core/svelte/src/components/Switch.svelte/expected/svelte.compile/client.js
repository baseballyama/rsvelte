import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<label><input type="checkbox" class="svelte-136ytug"/> <span class="svelte-136ytug"></span></label>`);

export default function Switch($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		css = $.prop($$props, 'css', 3, "");

	const inputId = $.proxy(getInputId($$props.id));

	function onChange(event) {
		value(event.target.checked);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	var label = root();
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(label);

	$.template_effect(() => {
		$.set_class(label, 1, `wx-switch ${css() ?? ''}`, 'svelte-136ytug');
		$.set_checked(input, value());
		input.disabled = disabled();
		$.set_attribute(input, 'id', inputId);
	});

	$.delegated('change', input, onChange);
	$.append($$anchor, label);
	$.pop();
}

$.delegate(['change']);