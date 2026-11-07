import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuSubState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'child',
	'children',
	'id',
	'ref',
	'value',
	'onValueChange',
	'orientation'
]);

var root = $.from_html(`<div><!></div>`);

export default function Navigation_menu_sub($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ""),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		orientation = $.prop($$props, 'orientation', 3, "horizontal"),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = NavigationMenuSubState.create({
		id: boxWith(() => id()),
		value: boxWith(() => value(), (v) => {
			value(v);
			onValueChange()(v);
		}),
		orientation: boxWith(() => orientation()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));
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