import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { LabelRootState } from "../label.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'id',
	'ref',
	'for'
]);

var root = $.from_html(`<label><!></label>`);

export default function Label($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = LabelRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props, { for: $$props.for }));
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
			var label = root();

			$.attribute_effect(label, () => ({ ...$.get(mergedProps), for: $$props.for }));

			var node_2 = $.child(label);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(label);
			$.append($$anchor, label);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}