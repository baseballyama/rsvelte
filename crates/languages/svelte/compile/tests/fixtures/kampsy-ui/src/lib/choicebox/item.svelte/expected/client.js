import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from "$lib/icons/check.svelte";
import { getContext } from "svelte";

import {
	resolveCheckboxCheckClass,
	resolveCheckboxContClass,
	resolveDescriptionClass,
	resolveItemLabelClass,
	resolveRadioContClass,
	resolveRadioDotClass,
	resolveTitleClass
} from "./styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'defaultChecked',
	'disabled',
	'description',
	'title',
	'value',
	'children',
	'class'
]);

var root = $.from_html(`<div><div class="flex h-4 w-4 items-center justify-center"><input type="radio" class="peer sr-only"/> <div></div></div></div>`);
var root_1 = $.from_html(`<div><div class="flex h-4 w-4 items-center justify-center"><input type="checkbox" class="peer sr-only"/> <div><!></div></div></div>`);
var root_2 = $.from_html(`<p> </p>`);
var root_3 = $.from_html(`<div class="mt-2 w-full"><!></div>`);
var root_4 = $.from_html(`<label><div class="flex w-full items-center justify-between p-3"><div class="w-full"><!> <!> <!></div> <!> <!></div></label>`);

export default function Item($$anchor, $$props) {
	const unique = $.props_id();

	$.push($$props, true);

	const radio = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();
				var div_1 = $.child(div);
				var input = $.child(div_1);

				$.remove_input_defaults(input);

				var div_2 = $.sibling(input, 2);

				$.reset(div_1);
				$.reset(div);

				$.template_effect(() => {
					$.set_class(div, 1, $.clsx($.get(radioContClass)));
					$.set_checked(input, $.get(isSelected));
					$.set_attribute(input, 'id', unique);
					$.set_attribute(input, 'name', groupState.name);
					$.set_value(input, $$props.value);
					input.disabled = $.get(isDisabled);
					$.set_class(div_2, 1, $.clsx($.get(radioDotClass)));
				});

				$.delegated('change', input, handleChange);
				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if (groupState.type === "radio") $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	const checkbox = ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				var div_3 = root_1();
				var div_4 = $.child(div_3);
				var input_1 = $.child(div_4);

				$.remove_input_defaults(input_1);

				var div_5 = $.sibling(input_1, 2);
				var node_2 = $.child(div_5);

				Check(node_2, {});
				$.reset(div_5);
				$.reset(div_4);
				$.reset(div_3);

				$.template_effect(() => {
					$.set_class(div_3, 1, $.clsx($.get(checkboxContClass)));
					$.set_checked(input_1, $.get(isSelected));
					$.set_attribute(input_1, 'id', unique);
					$.set_attribute(input_1, 'name', groupState.name);
					$.set_value(input_1, $$props.value);
					input_1.disabled = $.get(isDisabled);
					$.set_class(div_5, 1, $.clsx($.get(checkboxCheckClass)));
				});

				$.delegated('change', input_1, handleChange);
				$.append($$anchor, div_3);
			};

			$.if(node_1, ($$render) => {
				if (groupState.type === "checkbox") $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	};

	let defaultChecked = $.prop($$props, 'defaultChecked', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		description = $.prop($$props, 'description', 3, undefined),
		title = $.prop($$props, 'title', 3, undefined),
		children = $.prop($$props, 'children', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	const groupState = getContext("choicebox");
	let isDisabled = $.derived(() => disabled() || groupState.disabledParent);

	let isSelected = $.derived(() => {
		const current = groupState.get();

		if (groupState.type === "radio") return current === $$props.value;

		return Array.isArray(current) && current.includes($$props.value);
	});

	let defaultApplied = false;

	$.user_pre_effect(() => {
		if (defaultApplied || !defaultChecked()) return;

		defaultApplied = true;

		if (groupState.type === "radio") {
			groupState.set($$props.value);
		} else if (groupState.type === "checkbox") {
			groupState.set([...groupState.get(), $$props.value]);
		}
	});

	function handleChange(evt) {
		const target = evt.currentTarget;

		if (groupState.type === "radio") {
			groupState.set(target.value);
		} else if (groupState.type === "checkbox") {
			const current = groupState.get();
			const val = target.value;

			if (current.includes(val)) {
				groupState.set(current.filter((item) => item !== val));
			} else {
				groupState.set([...current, val]);
			}
		}
	}

	let labelClass = $.derived(() => resolveItemLabelClass({ disabled: $.get(isDisabled), selected: $.get(isSelected) }));
	let titleClass = $.derived(() => resolveTitleClass({ disabled: $.get(isDisabled), selected: $.get(isSelected) }));
	let descriptionClass = $.derived(() => resolveDescriptionClass({ disabled: $.get(isDisabled), selected: $.get(isSelected) }));
	let radioContClass = $.derived(() => resolveRadioContClass({ disabled: $.get(isDisabled), selected: $.get(isSelected) }));
	let radioDotClass = $.derived(() => resolveRadioDotClass({ selected: $.get(isSelected) }));
	let checkboxContClass = $.derived(() => resolveCheckboxContClass({ disabled: $.get(isDisabled), selected: $.get(isSelected) }));
	let checkboxCheckClass = $.derived(() => resolveCheckboxCheckClass({ selected: $.get(isSelected) }));
	var label = root_4();

	$.attribute_effect(label, () => ({
		for: unique,
		class: [$.get(labelClass), $$props.class],
		...rest
	}));

	var div_6 = $.child(label);
	var div_7 = $.child(div_6);
	var node_3 = $.child(div_7);

	{
		var consequent_2 = ($$anchor) => {
			var p = root_2();
			var text = $.only_child(p, true);

			$.template_effect(() => {
				$.set_class(p, 1, $.clsx($.get(titleClass)));
				$.set_text(text, title());
			});

			$.append($$anchor, p);
		};

		$.if(node_3, ($$render) => {
			if (title()) $$render(consequent_2);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var p_1 = root_2();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => {
				$.set_class(p_1, 1, $.clsx($.get(descriptionClass)));
				$.set_text(text_1, description());
			});

			$.append($$anchor, p_1);
		};

		$.if(node_4, ($$render) => {
			if (description()) $$render(consequent_3);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_8 = root_3();
			var node_6 = $.child(div_8);

			$.snippet(node_6, children);
			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_5, ($$render) => {
			if (children() && $.get(isSelected)) $$render(consequent_4);
		});
	}

	$.reset(div_7);

	var node_7 = $.sibling(div_7, 2);

	radio(node_7);

	var node_8 = $.sibling(node_7, 2);

	checkbox(node_8);
	$.reset(div_6);
	$.reset(label);
	$.append($$anchor, label);
	$.pop();
}

$.delegate(['change']);