import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { RadioGroupRootState } from "../radio-group.svelte.js";
import RadioGroupInput from "./radio-group-input.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'disabled',
	'children',
	'child',
	'value',
	'ref',
	'orientation',
	'loop',
	'name',
	'required',
	'readonly',
	'id',
	'onValueChange'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Radio_group($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		value = $.prop($$props, 'value', 15, ""),
		ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, "vertical"),
		loop = $.prop($$props, 'loop', 3, true),
		name = $.prop($$props, 'name', 3, undefined),
		required = $.prop($$props, 'required', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = RadioGroupRootState.create({
		orientation: boxWith(() => orientation()),
		disabled: boxWith(() => disabled()),
		loop: boxWith(() => loop()),
		name: boxWith(() => name()),
		required: boxWith(() => required()),
		readonly: boxWith(() => readonly()),
		id: boxWith(() => id()),
		value: boxWith(() => value(), (v) => {
			if (v === value()) return;

			value(v);
			onValueChange()?.(v);
		}),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));
	var fragment = root_1();
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

	var node_3 = $.sibling(node, 2);

	RadioGroupInput(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}