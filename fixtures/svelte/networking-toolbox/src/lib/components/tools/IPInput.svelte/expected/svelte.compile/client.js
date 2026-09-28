import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { validateIPv4 } from '$lib/utils/ip-validation.js';
import SvgIcon from '$lib/components/global/SvgIcon.svelte';

var root = $.from_html(`<span class="required">*</span>`);
var root_1 = $.from_html(`<label for="ip-input"> <!></label>`);
var root_2 = $.from_html(`<div class="status-icon success"><!></div>`);
var root_3 = $.from_html(`<div class="status-icon error"><!></div>`);
var root_4 = $.from_html(`<p class="field-error fade-in"> </p>`);
var root_5 = $.from_html(`<p class="field-help">Valid IPv4 address format</p>`);
var root_6 = $.from_html(`<div><!> <div class="field-input"><input id="ip-input" type="text"/> <div class="field-icon"><!></div></div> <!> <!></div>`);

export default function IPInput($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ''),
		placeholder = $.prop($$props, 'placeholder', 3, '192.168.1.1'),
		label = $.prop($$props, 'label', 3, 'IP Address'),
		required = $.prop($$props, 'required', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		className = $.prop($$props, 'class', 3, '');

	let validation = $.state($.proxy({ valid: true }));
	let focused = $.state(false);

	/**
	 * Validates input on change
	 */
	function handleInput(event) {
		const target = event.target;

		value(target.value);
		$.set(validation, validateIPv4(value()), true);
	}

	/**
	 * Formats IP address as user types
	 */
	function _formatIP(ip) {
		return ip.replace(/[^0-9.]/g, '');
	}

	var div = root_6();
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var label_1 = root_1();
			var text = $.child(label_1);
			var node_1 = $.sibling(text);

			{
				var consequent = ($$anchor) => {
					var span = root();

					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if (required()) $$render(consequent);
				});
			}

			$.reset(label_1);
			$.template_effect(() => $.set_text(text, `${label() ?? ''} `));
			$.append($$anchor, label_1);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent_1);
		});
	}

	var div_1 = $.sibling(node, 2);
	var input = $.child(div_1);

	$.remove_input_defaults(input);

	let classes;
	var div_2 = $.sibling(input, 2);
	var node_2 = $.child(div_2);

	{
		var consequent_2 = ($$anchor) => {
			var div_3 = root_2();
			var node_3 = $.child(div_3);

			SvgIcon(node_3, { icon: 'check', size: 'sm' });
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		var consequent_3 = ($$anchor) => {
			var div_4 = root_3();
			var node_4 = $.child(div_4);

			SvgIcon(node_4, { icon: 'close', size: 'sm' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if (value() && $.get(validation).valid) $$render(consequent_2); else if (value() && !$.get(validation).valid) $$render(consequent_3, 1);
		});
	}

	$.reset(div_2);
	$.reset(div_1);

	var node_5 = $.sibling(div_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var p = root_4();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get(validation).error));
			$.append($$anchor, p);
		};

		$.if(node_5, ($$render) => {
			if (!$.get(validation).valid && $.get(validation).error) $$render(consequent_4);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_5 = ($$anchor) => {
			var p_1 = root_5();

			$.append($$anchor, p_1);
		};

		$.if(node_6, ($$render) => {
			if ($.get(validation).valid && value()) $$render(consequent_5);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `form-field ${className() ?? ''}`, 'svelte-pg6h27');
		$.set_value(input, value());
		$.set_attribute(input, 'placeholder', placeholder());
		input.required = required();
		input.disabled = disabled();

		classes = $.set_class(input, 1, 'input-ip svelte-pg6h27', null, classes, {
			valid: $.get(validation).valid && value(),
			invalid: !$.get(validation).valid && value(),
			focused: $.get(focused)
		});
	});

	$.delegated('input', input, handleInput);
	$.event('focus', input, () => $.set(focused, true));
	$.event('blur', input, () => $.set(focused, false));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);