import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { RangeCalendarCellState } from "../range-calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'id',
	'ref',
	'date',
	'month'
]);

var root = $.from_html(`<td><!></td>`);

export default function Range_calendar_cell($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const cellState = RangeCalendarCellState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		date: boxWith(() => $$props.date),
		month: boxWith(() => $$props.month)
	});

	const mergedProps = $.derived(() => mergeProps(restProps, cellState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...cellState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var td = root();

			$.attribute_effect(td, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(td);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => cellState.snippetProps);
			$.reset(td);
			$.append($$anchor, td);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}