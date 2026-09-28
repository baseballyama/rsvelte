import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CheckboxGroupState } from "../checkbox.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import { arraysAreEqual } from "$lib/internal/arrays.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'value',
	'onValueChange',
	'name',
	'required',
	'disabled',
	'children',
	'child',
	'readonly'
]);

var root = $.from_html(`<div><!></div>`);

export default function Checkbox_group($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		value = $.prop($$props, 'value', 31, () => $.proxy([])),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	const groupState = CheckboxGroupState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		disabled: boxWith(() => Boolean($$props.disabled)),
		required: boxWith(() => Boolean($$props.required)),
		readonly: boxWith(() => Boolean($$props.readonly)),
		name: boxWith(() => $$props.name),
		value: boxWith(() => $.snapshot(value()), (v) => {
			if (arraysAreEqual(value(), v)) return;

			value($.snapshot(v));
			onValueChange()(v);
		}),
		onValueChange: boxWith(() => onValueChange())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, groupState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop);
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