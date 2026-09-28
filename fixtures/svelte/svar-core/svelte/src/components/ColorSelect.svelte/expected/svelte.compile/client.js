import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dropdown from "./Dropdown.svelte";
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<i class="wx-clear wxi-close svelte-kv4v0t"></i>`);
var root_1 = $.from_html(`<div class="wx-color wx-selected svelte-kv4v0t"></div>`);
var root_2 = $.from_html(`<div class="wx-empty wx-selected svelte-kv4v0t"></div>`);
var root_3 = $.from_html(`<div class="wx-color svelte-kv4v0t"></div>`);
var root_4 = $.from_html(`<div class="wx-colors svelte-kv4v0t"><div class="wx-empty svelte-kv4v0t"></div> <!></div>`);
var root_5 = $.from_html(`<div><input readonly=""/> <!> <!> <!></div>`);

export default function ColorSelect($$anchor, $$props) {
	$.push($$props, true);

	const defaultColors = [
		"#00a037",
		"#37a9ef",
		"#f5a623",
		"#ff4c3b",
		"#a0a0a0",
		"#000000",
		"#ffffff"
	];

	let colors = $.prop($$props, 'colors', 3, defaultColors),
		value = $.prop($$props, 'value', 15, ""),
		clear = $.prop($$props, 'clear', 3, false),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		css = $.prop($$props, 'css', 3, ""),
		dropdown = $.prop($$props, 'dropdown', 19, () => ({}));

	const inputId = $.proxy(getInputId($$props.id));
	let popup = $.state(false);

	function selectColor(ev, color) {
		ev.stopPropagation();
		value(color);
		$.set(popup, false);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function unselectColor(ev) {
		ev.stopPropagation();
		value("");
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function handlePopup() {
		if (disabled()) return false;

		$.set(popup, true);
	}

	var div = root_5();
	var input = $.child(div);

	$.remove_input_defaults(input);

	let classes;
	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var i = root();

			$.delegated('click', i, unselectColor);
			$.append($$anchor, i);
		};

		$.if(node, ($$render) => {
			if (clear() && value() && !disabled()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();

			$.template_effect(() => $.set_style(div_1, `background-color: ${(value() || '#00a037') ?? ''}`));
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_2();

			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if (value()) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			Dropdown($$anchor, $.spread_props({ oncancel: () => $.set(popup, false) }, dropdown, {
				children: ($$anchor, $$slotProps) => {
					var div_3 = root_4();
					var div_4 = $.child(div_3);
					var node_3 = $.sibling(div_4, 2);

					$.each(node_3, 17, colors, $.index, ($$anchor, color) => {
						var div_5 = root_3();

						$.template_effect(() => $.set_style(div_5, `background-color: ${$.get(color) ?? ''}`));
						$.delegated('click', div_5, (ev) => selectColor(ev, $.get(color)));
						$.append($$anchor, div_5);
					});

					$.reset(div_3);
					$.delegated('click', div_4, (ev) => selectColor(ev, ""));
					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			}));
		};

		$.if(node_2, ($$render) => {
			if ($.get(popup)) $$render(consequent_2);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-colorselect ${css() ?? ''}`, 'svelte-kv4v0t');
		$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
		$.set_attribute(input, 'title', title());
		$.set_value(input, value());
		$.set_attribute(input, 'id', inputId);
		$.set_attribute(input, 'placeholder', placeholder());
		input.disabled = disabled();
		classes = $.set_class(input, 1, 'svelte-kv4v0t', null, classes, { 'wx-error': error(), 'wx-focus': $.get(popup) });
	});

	$.delegated('click', div, handlePopup);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);