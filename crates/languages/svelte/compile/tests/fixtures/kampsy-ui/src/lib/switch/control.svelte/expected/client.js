import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { randomString } from "$lib/utils/random.js";
import { getContext } from "svelte";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div class="flex items-center justify-center"><div><!></div></div>`);
var root_2 = $.from_html(`<label><input type="radio" class="hidden"/> <!> <!></label>`);

export default function Control($$anchor, $$props) {
	$.push($$props, true);

	const // If defaultChecked is set and value
	// random string for unique id
	// Seting the width and height values to the label
	// Container seting the icon width and height
	// Wthen the selected value is the same as the value
	// If the switch is disabled
	withLabel = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $$props.label));
				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if ($$props.label && !icon()) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	const withIcon = ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				const Icon = $.derived(icon);
				var div_1 = root_1();
				var div_2 = $.child(div_1);
				var node_2 = $.child(div_2);

				$.component(node_2, () => $.get(Icon), ($$anchor, Icon_1) => {
					Icon_1($$anchor, {});
				});

				$.reset(div_2);
				$.reset(div_1);
				$.template_effect(() => $.set_class(div_2, 1, $.clsx($.get(iconContClass))));
				$.append($$anchor, div_1);
			};

			$.if(node_1, ($$render) => {
				if (icon() && !$$props.label) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	};

	let disabled = $.prop($$props, 'disabled', 3, undefined),
		icon = $.prop($$props, 'icon', 3, undefined);

	const rootState = getContext("switch");
	const { name, size, fullWidth } = rootState;

	if ($$props.defaultChecked) {
		rootState.setSelected($$props.value);
	}

	const onchange = (evt) => {
		const target = evt.currentTarget;

		rootState.setSelected(target.value);
	};

	// random string for unique id
	const unique = `${randomString(4)}_${$$props.value}`;

	const sizeObj = {
		small: "text-sm h-[24px] px-[12px] rounded-xs",
		medium: "text-sm h-8 px-[12px] rounded-xs",
		large: "text-base  h-[40px] px-[12px] rounded-sm"
	};

	let sizeClass = $.derived(() => {
		return sizeObj[size];
	});

	// Seting the width and height values to the label
	const iconSizeObj = {
		small: "h-[24px] px-[8px] py-[4px] rounded-xs",
		medium: "h-8 px-[12px] py-[8px] rounded-xs",
		large: "w-[40px] h-[40px] p-3 rounded-sm"
	};

	let iconSizeClass = $.derived(() => {
		return iconSizeObj[size];
	});

	// Container seting the icon width and height
	const iconCont = {
		small: "w-4 h-4",
		medium: "w-4 h-4",
		large: "w-[20px] h-[20px]"
	};

	let iconContClass = $.derived(() => {
		return iconCont[size];
	});

	// Wthen the selected value is the same as the value
	let selectedClass = $.derived(() => {
		// If the switch is disabled
		if (disabled()) {
			if (rootState.getSelected() === $$props.value) {
				return `text-kui-light-gray-700 dark:text-kui-dark-gray-700 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100`;
			}

			return `text-kui-light-gray-700 dark:text-kui-dark-gray-700`;
		}

		if (rootState.getSelected() === $$props.value) {
			return `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100`;
		}

		return `text-kui-light-gray-900 dark:text-kui-dark-gray-900 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000`;
	});

	let disabledClass = $.derived(() => {
		if (disabled()) {
			return `cursor-not-allowed`;
		}

		return "cursor-pointer";
	});

	let controlClass = $.derived(() => {
		if (fullWidth) {
			if (icon()) {
				return `w-full ${$.get(disabledClass)} ${$.get(iconSizeClass)} ${$.get(selectedClass)}`;
			}

			return `w-full ${$.get(disabledClass)} ${$.get(sizeClass)} ${$.get(selectedClass)}`;
		}

		if (icon()) {
			return `${$.get(disabledClass)} ${$.get(iconSizeClass)} ${$.get(selectedClass)}`;
		}

		return `${$.get(disabledClass)} ${$.get(sizeClass)} ${$.get(selectedClass)}`;
	});

	var label_1 = root_2();
	var input = $.child(label_1);

	$.remove_input_defaults(input);

	var node_3 = $.sibling(input, 2);

	withLabel(node_3);

	var node_4 = $.sibling(node_3, 2);

	withIcon(node_4);
	$.reset(label_1);

	$.template_effect(
		($0) => {
			$.set_attribute(label_1, 'for', unique);
			$.set_class(label_1, 1, `${$.get(controlClass) ?? ''}  flex items-center justify-center`);
			$.set_checked(input, $0);
			$.set_attribute(input, 'id', unique);
			$.set_attribute(input, 'name', name);
			$.set_value(input, $$props.value);
			input.disabled = disabled();
		},
		[() => rootState.getSelected() == $$props.value]
	);

	$.delegated('change', input, onchange);
	$.append($$anchor, label_1);
	$.pop();
}

$.delegate(['change']);