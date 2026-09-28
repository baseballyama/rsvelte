import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from "$lib/icons/check.svelte";
import Minus from "$lib/icons/minus.svelte";

import {
	resolveBoxClass,
	resolveIconClass,
	resolveLabelClass,
	resolveRootClass
} from "./styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'class',
	'checked',
	'indeterminate',
	'disabled',
	'children',
	'onclick'
]);

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<label><span class="relative flex items-center justify-center"><input/> <span aria-hidden="true"><span><!></span></span></span> <!></label>`);

export default function Checkbox($$anchor, $$props) {
	const fallbackId = $.props_id();

	$.push($$props, true);

	let checked = $.prop($$props, 'checked', 15, false),
		indeterminate = $.prop($$props, 'indeterminate', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	let id = $.derived(() => $$props.id ?? fallbackId);

	const handleClick = (evt) => {
		if (indeterminate()) {
			evt.preventDefault();
		}

		$$props.onclick?.(evt);
	};

	let boxClass = $.derived(() => resolveBoxClass({
		checked: checked(),
		indeterminate: indeterminate(),
		disabled: disabled()
	}));

	let iconClass = $.derived(() => resolveIconClass({
		checked: checked(),
		indeterminate: indeterminate(),
		disabled: disabled()
	}));

	let labelClass = $.derived(() => resolveLabelClass({ disabled: disabled() }));
	let rootClass = $.derived(() => resolveRootClass({ disabled: disabled() }));
	var label = root_1();
	var span = $.child(label);
	var input = $.child(span);

	$.attribute_effect(
		input,
		() => ({
			...rest,
			type: 'checkbox',
			id: $.get(id),
			indeterminate: indeterminate(),
			disabled: disabled(),
			class: 'peer sr-only',
			onclick: handleClick
		}),
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	var span_1 = $.sibling(input, 2);
	var span_2 = $.child(span_1);
	var node = $.child(span_2);

	{
		var consequent = ($$anchor) => {
			Minus($$anchor, {});
		};

		var consequent_1 = ($$anchor) => {
			Check($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (indeterminate()) $$render(consequent); else if (checked()) $$render(consequent_1, 1);
		});
	}

	$.reset(span_2);
	$.reset(span_1);
	$.reset(span);

	var node_1 = $.sibling(span, 2);

	{
		var consequent_2 = ($$anchor) => {
			var span_3 = root();
			var node_2 = $.child(span_3);

			$.snippet(node_2, () => $$props.children);
			$.reset(span_3);
			$.template_effect(() => $.set_class(span_3, 1, $.clsx($.get(labelClass))));
			$.append($$anchor, span_3);
		};

		$.if(node_1, ($$render) => {
			if ($$props.children) $$render(consequent_2);
		});
	}

	$.reset(label);

	$.template_effect(() => {
		$.set_attribute(label, 'for', $.get(id));
		$.set_class(label, 1, $.clsx([$.get(rootClass), $$props.class]));
		$.set_class(span_1, 1, $.clsx($.get(boxClass)));
		$.set_class(span_2, 1, $.clsx($.get(iconClass)));
	});

	$.bind_checked(input, checked);
	$.append($$anchor, label);
	$.pop();
}