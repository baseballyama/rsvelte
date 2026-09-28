import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<option class="svelte-1oopn40"> </option>`);
var root_1 = $.from_html(`<div class="wx-placeholder svelte-1oopn40"> </div>`);
var root_2 = $.from_html(`<i class="wx-icon wxi-close svelte-1oopn40"></i>`);
var root_3 = $.from_html(`<i class="wx-icon wxi-angle-down svelte-1oopn40"></i>`);
var root_4 = $.from_html(`<div><select></select> <!> <!></div>`);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		options = $.prop($$props, 'options', 19, () => []),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		textField = $.prop($$props, 'textField', 3, "label"),
		clear = $.prop($$props, 'clear', 3, false),
		css = $.prop($$props, 'css', 3, "");

	const inputId = $.proxy(getInputId($$props.id));

	function unselect() {
		value("");
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function handleChange() {
		$$props.onchange && $$props.onchange({ value: value() });
	}

	var div = root_4();
	var select = $.child(div);
	let classes;

	$.each(select, 21, options, (option) => option.id, ($$anchor, option) => {
		var option_1 = root();
		var text = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(option)[textField()]);

			if (option_1_value !== (option_1_value = $.get(option).id)) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select);
	$.init_select(select);

	var node = $.sibling(select, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var text_1 = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text_1, placeholder()));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!value() && value() !== 0) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var i = root_2();

			$.delegated('click', i, unselect);
			$.append($$anchor, i);
		};

		var alternate = ($$anchor) => {
			var i_1 = root_3();

			$.append($$anchor, i_1);
		};

		$.if(node_1, ($$render) => {
			if (clear() && !disabled() && value()) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-select ${css() ?? ''}`, 'svelte-1oopn40');
		$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
		$.set_attribute(select, 'id', inputId);
		select.disabled = disabled();
		$.set_attribute(select, 'title', title());
		classes = $.set_class(select, 1, 'svelte-1oopn40', null, classes, { 'wx-error': error() });
	});

	$.delegated('change', select, handleChange);
	$.bind_select_value(select, value);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);