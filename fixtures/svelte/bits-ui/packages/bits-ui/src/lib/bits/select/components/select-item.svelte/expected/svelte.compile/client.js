import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SelectItemState } from "../select.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import Mounted from "$lib/bits/utilities/mounted.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'value',
	'label',
	'disabled',
	'children',
	'child',
	'onHighlight',
	'onUnhighlight'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Select_item($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		label = $.prop($$props, 'label', 19, () => $$props.value),
		disabled = $.prop($$props, 'disabled', 3, false),
		onHighlight = $.prop($$props, 'onHighlight', 3, noop),
		onUnhighlight = $.prop($$props, 'onUnhighlight', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	const itemState = SelectItemState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		value: boxWith(() => $$props.value),
		disabled: boxWith(() => disabled()),
		label: boxWith(() => label()),
		onHighlight: boxWith(() => onHighlight()),
		onUnhighlight: boxWith(() => onUnhighlight())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, itemState.props));
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...itemState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => itemState.snippetProps);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_3 = $.sibling(node, 2);

	Mounted(node_3, {
		get mounted() {
			return itemState.mounted;
		},

		set mounted($$value) {
			itemState.mounted = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}