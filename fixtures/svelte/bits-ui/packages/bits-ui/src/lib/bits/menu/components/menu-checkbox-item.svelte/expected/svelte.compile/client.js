import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuCheckboxGroupContext, MenuCheckboxItemState } from "../menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'child',
	'children',
	'ref',
	'checked',
	'id',
	'onCheckedChange',
	'disabled',
	'onSelect',
	'closeOnSelect',
	'indeterminate',
	'onIndeterminateChange',
	'value'
]);

var root = $.from_html(`<div><!></div>`);

export default function Menu_checkbox_item($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		checked = $.prop($$props, 'checked', 15, false),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		onCheckedChange = $.prop($$props, 'onCheckedChange', 3, noop),
		disabled = $.prop($$props, 'disabled', 3, false),
		onSelect = $.prop($$props, 'onSelect', 3, noop),
		closeOnSelect = $.prop($$props, 'closeOnSelect', 3, true),
		indeterminate = $.prop($$props, 'indeterminate', 15, false),
		onIndeterminateChange = $.prop($$props, 'onIndeterminateChange', 3, noop),
		value = $.prop($$props, 'value', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	const group = MenuCheckboxGroupContext.getOr(null);

	if (group && value()) {
		if (group.opts.value.current.includes(value())) {
			checked(true);
		} else {
			checked(false);
		}
	}

	watch.pre(() => value(), () => {
		if (group && value()) {
			if (group.opts.value.current.includes(value())) {
				checked(true);
			} else {
				checked(false);
			}
		}
	});

	const checkboxItemState = MenuCheckboxItemState.create(
		{
			checked: boxWith(() => checked(), (v) => {
				if (v !== checked()) {
					checked(v);
					onCheckedChange()(v);
				}
			}),
			id: boxWith(() => id()),
			disabled: boxWith(() => disabled()),
			onSelect: boxWith(() => handleSelect),
			ref: boxWith(() => ref(), (v) => ref(v)),
			closeOnSelect: boxWith(() => closeOnSelect()),
			indeterminate: boxWith(() => indeterminate(), (v) => {
				if (v !== indeterminate()) {
					indeterminate(v);
					onIndeterminateChange()(v);
				}
			}),
			value: boxWith(() => value())
		},
		group
	);

	function handleSelect(e) {
		onSelect()(e);

		if (e.defaultPrevented) return;

		checkboxItemState.toggleChecked();
	}

	const mergedProps = $.derived(() => mergeProps(restProps, checkboxItemState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({
				checked: checked(),
				indeterminate: indeterminate(),
				props: $.get(mergedProps)
			}));

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ checked: checked(), indeterminate: indeterminate() }));
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}