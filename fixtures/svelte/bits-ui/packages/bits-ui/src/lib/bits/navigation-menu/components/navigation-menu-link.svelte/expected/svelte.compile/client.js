import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuLinkState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'child',
	'children',
	'active',
	'onSelect',
	'tabindex'
]);

var root = $.from_html(`<a><!></a>`);

export default function Navigation_menu_link($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		active = $.prop($$props, 'active', 3, false),
		onSelect = $.prop($$props, 'onSelect', 3, noop),
		tabindex = $.prop($$props, 'tabindex', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	const linkState = NavigationMenuLinkState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		active: boxWith(() => active()),
		onSelect: boxWith(() => onSelect())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, linkState.props, { tabindex: tabindex() }));
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
			var a = root();

			$.attribute_effect(a, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(a);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}