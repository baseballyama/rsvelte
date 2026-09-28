import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuCheckboxGroupState } from "../menu.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'children',
	'child',
	'ref',
	'value',
	'onValueChange'
]);

var root = $.from_html(`<div><!></div>`);

export default function Menu_checkbox_group($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 31, () => $.proxy([])),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	const checkboxGroupState = MenuCheckboxGroupState.create({
		value: boxWith(() => $.snapshot(value()), (v) => {
			value($.snapshot(v));
			onValueChange()(v);
		}),
		onValueChange: boxWith(() => onValueChange()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		id: boxWith(() => id())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, checkboxGroupState.props));
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