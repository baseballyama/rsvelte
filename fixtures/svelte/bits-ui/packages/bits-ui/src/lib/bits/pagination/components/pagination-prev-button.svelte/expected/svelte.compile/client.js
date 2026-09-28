import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PaginationButtonState } from "../pagination.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'child',
	'children',
	'ref',
	'type',
	'disabled'
]);

var root = $.from_html(`<button><!></button>`);

export default function Pagination_prev_button($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		type = $.prop($$props, 'type', 3, "button"),
		disabled = $.prop($$props, 'disabled', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const prevButtonState = PaginationButtonState.create({
		type: "prev",
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		disabled: boxWith(() => Boolean(disabled()))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, prevButtonState.props, { type: type() }));
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
			var button = root();

			$.attribute_effect(button, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(button);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}