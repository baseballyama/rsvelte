import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { validateCIDR } from '$lib/utils/ip-validation.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import SvgIcon from '$lib/components/global/SvgIcon.svelte';

var root = $.from_html(`<span class="required">*</span>`);
var root_1 = $.from_html(`<label for="cidr-input"> <!></label>`);
var root_2 = $.from_html(`<div class="status-icon success"><!></div>`);
var root_3 = $.from_html(`<div class="status-icon error"><!></div>`);
var root_4 = $.from_html(`<p class="field-error fade-in"> </p>`);
var root_5 = $.from_html(`<button type="button"> </button>`);
var root_6 = $.from_html(`<div><!> <div class="field-input"><input id="cidr-input" type="text"/> <div class="field-icon"><!></div></div> <!> <div class="presets-section svelte-zkysce"><p class="presets-label svelte-zkysce">Quick presets:</p> <div class="presets-grid svelte-zkysce"></div></div></div>`);

export default function CIDRInput($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ''),
		placeholder = $.prop($$props, 'placeholder', 3, '192.168.1.0/24'),
		label = $.prop($$props, 'label', 3, 'CIDR Notation'),
		required = $.prop($$props, 'required', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		className = $.prop($$props, 'class', 3, '');

	let validation = $.state($.proxy({ valid: true }));
	let focused = $.state(false);

	/**
	 * Quick CIDR presets
	 */
	const cidrPresets = [
		{ cidr: 8, label: '/8', hosts: '16M hosts' },
		{ cidr: 16, label: '/16', hosts: '65K hosts' },
		{ cidr: 24, label: '/24', hosts: '254 hosts' },
		{ cidr: 25, label: '/25', hosts: '126 hosts' },
		{ cidr: 26, label: '/26', hosts: '62 hosts' },
		{ cidr: 27, label: '/27', hosts: '30 hosts' },
		{ cidr: 28, label: '/28', hosts: '14 hosts' },
		{ cidr: 30, label: '/30 (P2P)', hosts: '2 hosts' }
	];

	/**
	 * Check if current value matches a preset
	 */
	function getActivePreset() {
		if (!value() || !value().includes('/')) return null;

		const currentCidr = parseInt(value().split('/')[1], 10);

		return cidrPresets.find((p) => p.cidr === currentCidr)?.cidr || null;
	}

	// Derive active preset from current value
	const activePreset = $.derived(getActivePreset);

	/**
	 * Validates CIDR input on change
	 */
	function handleInput(event) {
		const target = event.target;

		value(target.value);
		$.set(validation, validateCIDR(value()), true);
	}

	/**
	 * Applies CIDR preset
	 */
	function applyPreset(cidr) {
		if (value() && value().includes('/')) {
			const ip = value().split('/')[0];

			value(`${ip}/${cidr}`);
		} else if (value()) {
			value(`${value()}/${cidr}`);
		}

		$.set(validation, validateCIDR(value()), true);
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
			var p_1 = root_4();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(validation).error));
			$.append($$anchor, p_1);
		};

		$.if(node_5, ($$render) => {
			if (!$.get(validation).valid && $.get(validation).error) $$render(consequent_4);
		});
	}

	var div_5 = $.sibling(node_5, 2);
	var div_6 = $.sibling($.child(div_5), 2);

	$.each(div_6, 21, () => cidrPresets, (preset) => preset.cidr, ($$anchor, preset) => {
		Tooltip($$anchor, {
			get text() {
				return `Apply ${$.get(preset).label ?? ''} - ${$.get(preset).hosts ?? ''}`;
			},
			position: 'top',
			children: ($$anchor, $$slotProps) => {
				var button = root_5();
				var text_2 = $.only_child(button, true);

				$.template_effect(() => {
					$.set_class(button, 1, `preset-btn ${$.get(activePreset) === $.get(preset).cidr ? 'active' : ''}`, 'svelte-zkysce');
					button.disabled = disabled();
					$.set_attribute(button, 'aria-label', `Apply ${$.get(preset).label ?? ''} preset with ${$.get(preset).hosts ?? ''}`);
					$.set_text(text_2, $.get(preset).label);
				});

				$.delegated('click', button, () => applyPreset($.get(preset).cidr));
				$.append($$anchor, button);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_6);
	$.reset(div_5);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `form-field ${className() ?? ''}`, 'svelte-zkysce');
		$.set_value(input, value());
		$.set_attribute(input, 'placeholder', placeholder());
		input.required = required();
		input.disabled = disabled();

		classes = $.set_class(input, 1, 'input-cidr svelte-zkysce', null, classes, {
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

$.delegate(['input', 'click']);