import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandSeparatorState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'forceMount',
	'children',
	'child'
]);

var root = $.from_html(`<div><!></div>`);

export default function Command_separator($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const separatorState = CommandSeparatorState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		forceMount: boxWith(() => forceMount())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, separatorState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
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
		};

		$.if(node, ($$render) => {
			if (separatorState.shouldRender) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}