import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<textarea></textarea>`);

export default function TextArea($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		css = $.prop($$props, 'css', 3, "");

	const inputId = $.proxy(getInputId($$props.id));
	var textarea = root();

	$.remove_textarea_child(textarea);

	let classes;

	$.template_effect(() => {
		classes = $.set_class(textarea, 1, `wx-textarea ${css() ?? ''}`, 'svelte-vseiui', classes, { 'wx-error': error() });
		$.set_attribute(textarea, 'id', inputId);
		textarea.disabled = disabled();
		$.set_attribute(textarea, 'placeholder', placeholder());
		textarea.readOnly = readonly();
		$.set_attribute(textarea, 'title', title());
		$.set_attribute(textarea, 'data-tooltip-text', $$props.tooltip);
	});

	$.delegated('input', textarea, () => $$props.onchange && $$props.onchange({ value: value(), input: true }));
	$.delegated('change', textarea, () => $$props.onchange && $$props.onchange({ value: value() }));
	$.bind_value(textarea, value);
	$.append($$anchor, textarea);
	$.pop();
}

$.delegate(['input', 'change']);