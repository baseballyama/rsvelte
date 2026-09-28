import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DateRangeFieldInputState } from "../date-range-field.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import DateFieldHiddenInput from "$lib/bits/date-field/components/date-field-hidden-input.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'name',
	'child',
	'children',
	'type'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Date_range_field_input($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		name = $.prop($$props, 'name', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	const inputState = DateRangeFieldInputState.create(
		{
			id: boxWith(() => id()),
			ref: boxWith(() => ref(), (v) => ref(v)),
			name: boxWith(() => name())
		},
		$$props.type
	);

	const mergedProps = $.derived(() => mergeProps(restProps, inputState.props, { role: "presentation" }));
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({
				props: $.get(mergedProps),
				segments: inputState.root.segmentContents
			}));

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ segments: inputState.root.segmentContents }));
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_3 = $.sibling(node, 2);

	DateFieldHiddenInput(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}