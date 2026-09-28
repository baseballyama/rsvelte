import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dropdown from "./Dropdown.svelte";
import ColorBoard from "./ColorBoard.svelte";
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<i class="wxi-close svelte-1h4catv"></i>`);
var root_1 = $.from_html(`<div><input readonly=""/> <div class="wx-color svelte-1h4catv"></div> <!> <!></div>`);

export default function ColorPicker($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		clear = $.prop($$props, 'clear', 3, false),
		css = $.prop($$props, 'css', 3, ""),
		dropdown = $.prop($$props, 'dropdown', 19, () => ({}));

	const inputId = $.proxy(getInputId($$props.id));
	let popup = $.state(false);

	function handlePopup() {
		if (disabled()) return false;

		$.set(popup, true);
	}

	function selectColor(ev) {
		if (ev.input) return;

		$.set(popup, false);
		value(ev.value);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function unselectColor(ev) {
		ev.stopPropagation();
		value("");
		$$props.onchange && $$props.onchange({ value: value() });
	}

	var div = root_1();
	var input = $.child(div);

	$.remove_input_defaults(input);

	let classes;
	var div_1 = $.sibling(input, 2);
	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var i = root();

			$.delegated('click', i, unselectColor);
			$.append($$anchor, i);
		};

		$.if(node, ($$render) => {
			if (clear() && !disabled() && value()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Dropdown($$anchor, $.spread_props({ oncancel: () => $.set(popup, false) }, dropdown, {
				children: ($$anchor, $$slotProps) => {
					ColorBoard($$anchor, {
						get value() {
							return value();
						},
						button: 'true',
						onchange: selectColor
					});
				},
				$$slots: { default: true }
			}));
		};

		$.if(node_1, ($$render) => {
			if ($.get(popup)) $$render(consequent_1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-colorpicker ${css() ?? ''}`, 'svelte-1h4catv');
		$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
		$.set_attribute(input, 'title', title());
		$.set_value(input, value());
		$.set_attribute(input, 'id', inputId);
		$.set_attribute(input, 'placeholder', placeholder());
		input.disabled = disabled();
		classes = $.set_class(input, 1, 'svelte-1h4catv', null, classes, { 'wx-error': error(), 'wx-focus': $.get(popup) });
		$.set_style(div_1, `background: ${value() ?? ''}`);
	});

	$.delegated('click', div, handlePopup);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);