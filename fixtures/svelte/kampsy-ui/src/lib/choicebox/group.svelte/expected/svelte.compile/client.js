import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { randomString } from "$lib/utils/random.js";
import { setContext } from "svelte";
import { createGroupState } from "./group.svelte.js";
import { groupRootBase, listBase, resolveGroupLabelClass } from "./styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'label',
	'value',
	'disabled',
	'showLabel',
	'listClassName',
	'onchange',
	'children',
	'class'
]);

var root = $.from_html(`<legend> </legend>`);
var root_1 = $.from_html(`<fieldset><!> <div><!></div></fieldset>`);

export default function Group($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, "radio"),
		label = $.prop($$props, 'label', 3, undefined),
		value = $.prop($$props, 'value', 15, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		showLabel = $.prop($$props, 'showLabel', 3, true),
		listClassName = $.prop($$props, 'listClassName', 3, undefined),
		onchange = $.prop($$props, 'onchange', 3, undefined),
		children = $.prop($$props, 'children', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	const groupState = createGroupState({
		selected: "",
		name: randomString(8),
		get type() {
			return type();
		},

		get disabledParent() {
			return disabled();
		},
		onchange: (value) => onchange()?.(value)
	});

	setContext("choicebox", groupState);

	let legendClass = $.derived(() => {
		return [
			resolveGroupLabelClass({ disabled: disabled() }),
			!showLabel() && "sr-only"
		];
	});

	$.user_effect(() => {
		value(groupState.get());
	});

	var fieldset = root_1();

	$.attribute_effect(fieldset, () => ({ class: [groupRootBase, $$props.class], ...rest }));

	var node = $.child(fieldset);

	{
		var consequent = ($$anchor) => {
			var legend = root();
			var text = $.only_child(legend, true);

			$.template_effect(() => {
				$.set_class(legend, 1, $.clsx($.get(legendClass)));
				$.set_text(text, label());
			});

			$.append($$anchor, legend);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, children);
			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if (children()) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.reset(fieldset);
	$.template_effect(() => $.set_class(div, 1, $.clsx([listBase, listClassName()])));
	$.append($$anchor, fieldset);
	$.pop();
}