import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuItemState } from "../menu.svelte.js";
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
	'onSelect',
	'closeOnSelect'
]);

var root = $.from_html(`<div><!></div>`);

export default function Menu_item($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		onSelect = $.prop($$props, 'onSelect', 3, noop),
		closeOnSelect = $.prop($$props, 'closeOnSelect', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const itemState = MenuItemState.create({
		id: boxWith(() => id()),
		disabled: boxWith(() => disabled()),
		onSelect: boxWith(() => onSelect()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		closeOnSelect: boxWith(() => closeOnSelect())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, itemState.props));
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