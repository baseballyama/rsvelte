import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<input type="password" class="svelte-rzzsv7"/>`);
var root_1 = $.from_html(`<input type="number" class="svelte-rzzsv7"/>`);
var root_2 = $.from_html(`<input class="svelte-rzzsv7"/>`);
var root_3 = $.from_html(`<i></i>`);
var root_4 = $.from_html(`<i class="wx-icon wxi-close svelte-rzzsv7"></i> <!>`, 1);
var root_5 = $.from_html(`<div><!> <!></div>`);

export default function Text($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		readonly = $.prop($$props, 'readonly', 3, false),
		focus = $.prop($$props, 'focus', 3, false),
		select = $.prop($$props, 'select', 3, false),
		type = $.prop($$props, 'type', 3, "text"),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		title = $.prop($$props, 'title', 3, ""),
		css = $.prop($$props, 'css', 3, ""),
		icon = $.prop($$props, 'icon', 3, ""),
		clear = $.prop($$props, 'clear', 3, false);

	const inputId = $.proxy(getInputId($$props.id));
	let cssString = $.derived(() => icon() && css().indexOf("wx-icon-left") === -1 ? "wx-icon-right " + css() : css());
	let hasLeftIcon = $.derived(() => icon() && css().indexOf("wx-icon-left") !== -1);

	// svelte-ignore non_reactive_update
	let input;

	onMount(() => {
		// wait till the source click processing will end
		setTimeout(
			() => {
				if (focus() && input) input.focus();
				if (select() && input) input.select();
			},
			1
		);
	});

	const oninput = () => $$props.onchange && $$props.onchange({ value: value(), input: true });
	const change = () => $$props.onchange && $$props.onchange({ value: value() });

	function clearValue(ev) {
		ev.stopPropagation();
		value("");
		$$props.onchange && $$props.onchange({ value: value() });
	}

	var div = root_5();
	let classes;
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var input_1 = root();

			$.remove_input_defaults(input_1);
			$.bind_this(input_1, ($$value) => input = $$value, () => input);

			$.template_effect(() => {
				$.set_attribute(input_1, 'id', inputId);
				input_1.readOnly = readonly();
				input_1.disabled = disabled();
				$.set_attribute(input_1, 'placeholder', placeholder());
				$.set_attribute(input_1, 'title', title());
			});

			$.delegated('input', input_1, oninput);
			$.delegated('change', input_1, change);
			$.bind_value(input_1, value);
			$.append($$anchor, input_1);
		};

		var consequent_1 = ($$anchor) => {
			var input_2 = root_1();

			$.remove_input_defaults(input_2);
			$.bind_this(input_2, ($$value) => input = $$value, () => input);

			$.template_effect(() => {
				$.set_attribute(input_2, 'id', inputId);
				input_2.readOnly = readonly();
				input_2.disabled = disabled();
				$.set_attribute(input_2, 'placeholder', placeholder());
				$.set_attribute(input_2, 'title', title());
			});

			$.delegated('input', input_2, oninput);
			$.delegated('change', input_2, change);
			$.bind_value(input_2, value);
			$.append($$anchor, input_2);
		};

		var alternate = ($$anchor) => {
			var input_3 = root_2();

			$.remove_input_defaults(input_3);
			$.bind_this(input_3, ($$value) => input = $$value, () => input);

			$.template_effect(() => {
				$.set_attribute(input_3, 'id', inputId);
				input_3.readOnly = readonly();
				input_3.disabled = disabled();
				$.set_attribute(input_3, 'placeholder', placeholder());
				$.set_attribute(input_3, 'title', title());
			});

			$.delegated('input', input_3, oninput);
			$.delegated('change', input_3, change);
			$.bind_value(input_3, value);
			$.append($$anchor, input_3);
		};

		$.if(node, ($$render) => {
			if (type() == "password") $$render(consequent); else if (type() == "number") $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = root_4();
			var i = $.first_child(fragment);
			var node_2 = $.sibling(i, 2);

			{
				var consequent_2 = ($$anchor) => {
					var i_1 = root_3();

					$.template_effect(() => $.set_class(i_1, 1, `wx-icon ${icon() ?? ''}`, 'svelte-rzzsv7'));
					$.append($$anchor, i_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(hasLeftIcon)) $$render(consequent_2);
				});
			}

			$.delegated('click', i, clearValue);
			$.append($$anchor, fragment);
		};

		var consequent_4 = ($$anchor) => {
			var i_2 = root_3();

			$.template_effect(() => $.set_class(i_2, 1, `wx-icon ${icon() ?? ''}`, 'svelte-rzzsv7'));
			$.append($$anchor, i_2);
		};

		$.if(node_1, ($$render) => {
			if (clear() && !disabled() && value()) $$render(consequent_3); else if (icon()) $$render(consequent_4, 1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, `wx-text ${$.get(cssString) ?? ''}`, 'svelte-rzzsv7', classes, {
			'wx-error': error(),
			'wx-disabled': disabled(),
			'wx-clear': clear()
		});

		$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input', 'change', 'click']);