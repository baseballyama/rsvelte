import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandInputState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'autofocus',
	'id',
	'ref',
	'child'
]);

var root = $.from_html(`<input/>`);

export default function Command_input($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		autofocus = $.prop($$props, 'autofocus', 3, false),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const inputState = CommandInputState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		value: boxWith(() => value(), (v) => {
			value(v);
		}),
		autofocus: boxWith(() => autofocus() ?? false)
	});

	const mergedProps = $.derived(() => mergeProps(restProps, inputState.props));
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
			var input = root();

			$.attribute_effect(input, () => ({ ...$.get(mergedProps) }), void 0, void 0, void 0, void 0, true);
			$.bind_value(input, value);
			$.append($$anchor, input);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}