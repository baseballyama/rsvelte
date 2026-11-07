import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuRootState } from "../navigation-menu.svelte.js";
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
	'delayDuration',
	'skipDelayDuration',
	'dir',
	'orientation'
]);

var root = $.from_html(`<nav><!></nav>`);

export default function Navigation_menu($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ""),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		delayDuration = $.prop($$props, 'delayDuration', 3, 200),
		skipDelayDuration = $.prop($$props, 'skipDelayDuration', 3, 300),
		dir = $.prop($$props, 'dir', 3, "ltr"),
		orientation = $.prop($$props, 'orientation', 3, "horizontal"),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = NavigationMenuRootState.create({
		id: boxWith(() => id()),
		value: boxWith(() => value(), (v) => {
			value(v);
			onValueChange()(v);
		}),
		delayDuration: boxWith(() => delayDuration()),
		skipDelayDuration: boxWith(() => skipDelayDuration()),
		dir: boxWith(() => dir()),
		orientation: boxWith(() => orientation()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps({ "aria-label": "main" }, restProps, rootState.props));
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
			var nav = root();

			$.attribute_effect(nav, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(nav);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(nav);
			$.append($$anchor, nav);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}