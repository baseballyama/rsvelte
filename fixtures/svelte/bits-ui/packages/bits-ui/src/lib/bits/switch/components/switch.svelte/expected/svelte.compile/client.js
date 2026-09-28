import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SwitchRootState } from "../switch.svelte.js";
import SwitchInput from "./switch-input.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'child',
	'children',
	'ref',
	'id',
	'disabled',
	'required',
	'checked',
	'value',
	'name',
	'type',
	'onCheckedChange'
]);

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Switch($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		required = $.prop($$props, 'required', 3, false),
		checked = $.prop($$props, 'checked', 15, false),
		value = $.prop($$props, 'value', 3, "on"),
		name = $.prop($$props, 'name', 3, undefined),
		type = $.prop($$props, 'type', 3, "button"),
		onCheckedChange = $.prop($$props, 'onCheckedChange', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = SwitchRootState.create({
		checked: boxWith(() => checked(), (v) => {
			checked(v);
			onCheckedChange()?.(v);
		}),
		disabled: boxWith(() => disabled() ?? false),
		required: boxWith(() => required()),
		value: boxWith(() => value()),
		name: boxWith(() => name()),
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props, { type: type() }));
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

	SwitchInput(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}