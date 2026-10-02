import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandListState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'child',
	'children',
	'aria-label'
]);

var root = $.from_html(`<div><!></div>`);

export default function Command_list($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const listState = CommandListState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		ariaLabel: boxWith(() => $$props['aria-label'] ?? "Suggestions...")
	});

	const mergedProps = $.derived(() => mergeProps(restProps, listState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => listState.root._commandState.search === "", ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $$props.child, () => ({ props: $.get(mergedProps) }));
				$.append($$anchor, fragment_2);
			};

			var alternate = ($$anchor) => {
				var div = root();

				$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

				var node_3 = $.child(div);

				$.snippet(node_3, () => $$props.children ?? $.noop);
				$.reset(div);
				$.append($$anchor, div);
			};

			$.if(node_1, ($$render) => {
				if ($$props.child) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}