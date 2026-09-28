import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuListState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import Mounted from "$lib/bits/utilities/mounted.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'children',
	'child',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><ul><!></ul></div> <!>`, 1);

export default function Navigation_menu_list($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const listState = NavigationMenuListState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, listState.props));
	const wrapperProps = $.derived(() => mergeProps(listState.wrapperProps));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps), wrapperProps: $.get(wrapperProps) }));

			var node_2 = $.sibling(node_1, 2);

			Mounted(node_2, {
				get mounted() {
					return listState.wrapperMounted;
				},

				set mounted($$value) {
					listState.wrapperMounted = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_1();
			var div = $.first_child(fragment_2);

			$.attribute_effect(div, () => ({ ...$.get(wrapperProps) }));

			var ul = $.child(div);

			$.attribute_effect(ul, () => ({ ...$.get(mergedProps) }));

			var node_3 = $.child(ul);

			$.snippet(node_3, () => $$props.children ?? $.noop);
			$.reset(ul);
			$.reset(div);

			var node_4 = $.sibling(div, 2);

			Mounted(node_4, {
				get mounted() {
					return listState.wrapperMounted;
				},

				set mounted($$value) {
					listState.wrapperMounted = $$value;
				}
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}