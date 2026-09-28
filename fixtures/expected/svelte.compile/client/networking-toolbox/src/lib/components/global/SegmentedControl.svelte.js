import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip.js';

var root = $.from_html(`<span class="segment-label"> </span>`);
var root_1 = $.from_html(`<button><!> <!></button>`);
var root_2 = $.from_html(`<div><div class="buttons-container svelte-j9qfmp"><div class="active-indicator svelte-j9qfmp"></div> <!></div></div>`);

export default function SegmentedControl($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		className = $.prop($$props, 'class', 3, ''),
		hideLabel = $.prop($$props, 'hideLabel', 3, false);

	let buttonsContainer;

	// Track the active indicator position and width
	let indicatorStyle = $.state('');

	// Check if all options have icons
	const allHaveIcons = $.derived(() => $$props.options.every((opt) => opt.icon));

	const shouldHideLabel = $.derived(() => hideLabel() && $.get(allHaveIcons));

	// Update indicator position when value or hideLabel changes
	$.user_effect(() => {
		if (buttonsContainer && value()) {
			// Use requestAnimationFrame to ensure DOM has updated after hideLabel changes
			requestAnimationFrame(() => {
				const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
				const activeIndex = $$props.options.findIndex((opt) => opt.value === value());
				const button = buttons[activeIndex];

				if (button) {
					updateIndicator(button);
				}
			});
		}
	});

	function updateIndicator(button) {
		if (!buttonsContainer) return;

		const containerRect = buttonsContainer.getBoundingClientRect();
		const buttonRect = button.getBoundingClientRect();
		const left = buttonRect.left - containerRect.left;
		const width = buttonRect.width;

		$.set(indicatorStyle, `transform: translateX(${left}px); width: ${width}px;`);
	}

	function handleClick(option) {
		value(option.value);

		if (option.href) {
			goto(option.href);
		} else if ($$props.onchange) {
			$$props.onchange(option.value);
		}
	}

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.sibling(div_2, 2);

	$.each(node, 17, () => $$props.options, (option) => option.value, ($$anchor, option) => {
		var button_1 = root_1();
		let classes;
		var node_1 = $.child(button_1);

		{
			var consequent = ($$anchor) => {
				Icon($$anchor, {
					get name() {
						return $.get(option).icon;
					},
					size: 'sm'
				});
			};

			$.if(node_1, ($$render) => {
				if ($.get(option).icon) $$render(consequent);
			});
		}

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent_1 = ($$anchor) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $.get(option).label));
				$.append($$anchor, span);
			};

			$.if(node_2, ($$render) => {
				if (!$.get(shouldHideLabel)) $$render(consequent_1);
			});
		}

		$.reset(button_1);
		$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(shouldHideLabel) ? $.get(option).label : undefined);

		$.template_effect(() => {
			classes = $.set_class(button_1, 1, 'segment-btn svelte-j9qfmp', null, classes, {
				active: value() === $.get(option).value,
				'icon-only': $.get(shouldHideLabel) && $.get(option).icon
			});

			$.set_attribute(button_1, 'aria-pressed', value() === $.get(option).value);
		});

		$.delegated('click', button_1, () => handleClick($.get(option)));
		$.append($$anchor, button_1);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => buttonsContainer = $$value, () => buttonsContainer);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `segmented-control ${className() ?? ''}`, 'svelte-j9qfmp');
		$.set_style(div_2, $.get(indicatorStyle));
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);