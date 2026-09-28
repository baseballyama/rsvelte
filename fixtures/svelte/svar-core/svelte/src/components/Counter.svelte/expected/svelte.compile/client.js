import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<div><button aria-label="-" class="wx-btn wx-btn-dec svelte-x094r8"><svg class="wx-dec svelte-x094r8" width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2501 1.74994H0.750092V0.249939H11.2501V1.74994Z"></path></svg></button> <input type="text" class="wx-input svelte-x094r8" required=""/> <button aria-label="-" class="wx-btn wx-btn-inc svelte-x094r8"><svg class="wx-inc svelte-x094r8" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2501
                6.74994H6.75009V11.2499H5.25009V6.74994H0.750092V5.24994H5.25009V0.749939H6.75009V5.24994H11.2501V6.74994Z"></path></svg></button></div>`);

export default function Counter($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, 0),
		step = $.prop($$props, 'step', 3, 1),
		min = $.prop($$props, 'min', 3, 0),
		max = $.prop($$props, 'max', 3, Infinity),
		error = $.prop($$props, 'error', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		css = $.prop($$props, 'css', 3, "");

	const inputId = $.proxy(getInputId($$props.id));

	function dec() {
		if (readonly() || value() <= min()) return;

		value(value() - step());
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function inc() {
		if (readonly() || value() >= max()) return;

		value(value() + step());
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function blur() {
		if (!readonly()) {
			const tValue = Math.round(Math.min(max(), Math.max(value(), min())) / step()) * step();

			value(isNaN(tValue) ? Math.max(min(), 0) : tValue);
			$$props.onchange && $$props.onchange({ value: value() });
		}
	}

	function input(e) {
		$$props.onchange && $$props.onchange({ value: e.target.value * 1, input: true });
	}

	var div = root();
	let classes;
	var button = $.child(div);
	var input_1 = $.sibling(button, 2);

	$.remove_input_defaults(input_1);

	var button_1 = $.sibling(input_1, 2);

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, `wx-counter ${css() ?? ''}`, 'svelte-x094r8', classes, {
			'wx-disabled': disabled(),
			'wx-readonly': readonly(),
			'wx-error': error()
		});

		$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
		button.disabled = disabled();
		$.set_attribute(input_1, 'id', inputId);
		input_1.disabled = disabled();
		input_1.readOnly = readonly();
		button_1.disabled = disabled();
	});

	$.delegated('click', button, dec);
	$.event('blur', input_1, blur);
	$.delegated('input', input_1, input);
	$.bind_value(input_1, value);
	$.delegated('click', button_1, inc);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);