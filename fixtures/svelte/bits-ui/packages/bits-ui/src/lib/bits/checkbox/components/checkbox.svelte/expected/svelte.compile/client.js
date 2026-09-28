import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CheckboxGroupContext, CheckboxRootState } from "../checkbox.svelte.js";
import CheckboxInput from "./checkbox-input.svelte";
import { createId } from "$lib/internal/create-id.js";
import { watch } from "runed";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'checked',
	'ref',
	'onCheckedChange',
	'children',
	'disabled',
	'required',
	'name',
	'form',
	'value',
	'id',
	'indeterminate',
	'onIndeterminateChange',
	'child',
	'type',
	'readonly'
]);

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Checkbox($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let checked = $.prop($$props, 'checked', 15, false),
		ref = $.prop($$props, 'ref', 15, null),
		disabled = $.prop($$props, 'disabled', 3, false),
		required = $.prop($$props, 'required', 3, false),
		name = $.prop($$props, 'name', 3, undefined),
		form = $.prop($$props, 'form', 3, undefined),
		value = $.prop($$props, 'value', 3, "on"),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		indeterminate = $.prop($$props, 'indeterminate', 15, false),
		type = $.prop($$props, 'type', 3, "button"),
		restProps = $.rest_props($$props, rest_excludes);

	const group = CheckboxGroupContext.getOr(null);

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

	const rootState = CheckboxRootState.create(
		{
			checked: boxWith(() => checked(), (v) => {
				checked(v);
				$$props.onCheckedChange?.(v);
			}),
			disabled: boxWith(() => disabled() ?? false),
			required: boxWith(() => required()),
			name: boxWith(() => name()),
			form: boxWith(() => form()),
			value: boxWith(() => value()),
			id: boxWith(() => id()),
			ref: boxWith(() => ref(), (v) => ref(v)),
			indeterminate: boxWith(() => indeterminate(), (v) => {
				indeterminate(v);
				$$props.onIndeterminateChange?.(v);
			}),
			type: boxWith(() => type()),
			readonly: boxWith(() => Boolean($$props.readonly))
		},
		group
	);

	const mergedProps = $.derived(() => mergeProps({ ...restProps }, rootState.props));
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...rootState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(button);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => rootState.snippetProps);
			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_3 = $.sibling(node, 2);

	CheckboxInput(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}