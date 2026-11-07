import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuItemState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'value',
	'ref',
	'child',
	'children',
	'openOnHover'
]);

var root = $.from_html(`<li><!></li>`);

export default function Navigation_menu_item($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const defaultId = createId(uid);

	let id = $.prop($$props, 'id', 3, defaultId),
		value = $.prop($$props, 'value', 3, defaultId),
		ref = $.prop($$props, 'ref', 15, null),
		openOnHover = $.prop($$props, 'openOnHover', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const itemState = NavigationMenuItemState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		value: boxWith(() => value()),
		openOnHover: boxWith(() => openOnHover())
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
			var li = root();

			$.attribute_effect(li, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(li);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(li);
			$.append($$anchor, li);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}