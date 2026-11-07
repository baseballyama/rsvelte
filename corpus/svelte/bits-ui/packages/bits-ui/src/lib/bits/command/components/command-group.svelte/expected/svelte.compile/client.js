import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandGroupContainerState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'value',
	'forceMount',
	'children',
	'child'
]);

var root = $.from_html(`<div><!></div>`);

export default function Command_group($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 3, ""),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const groupState = CommandGroupContainerState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		forceMount: boxWith(() => forceMount()),
		value: boxWith(() => value())
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