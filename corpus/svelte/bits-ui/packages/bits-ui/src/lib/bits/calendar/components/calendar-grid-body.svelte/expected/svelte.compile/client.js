import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CalendarGridBodyState } from "../calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'ref',
	'id'
]);

var root = $.from_html(`<tbody><!></tbody>`);

export default function Calendar_grid_body($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		restProps = $.rest_props($$props, rest_excludes);

	const gridBodyState = CalendarGridBodyState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, gridBodyState.props));
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
			var tbody = root();

			$.attribute_effect(tbody, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(tbody);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(tbody);
			$.append($$anchor, tbody);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}