import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuRadioItemState } from "../menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'ref',
	'value',
	'onSelect',
	'id',
	'disabled',
	'closeOnSelect'
]);

var root = $.from_html(`<div><!></div>`);

export default function Menu_radio_item($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		onSelect = $.prop($$props, 'onSelect', 3, noop),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		closeOnSelect = $.prop($$props, 'closeOnSelect', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const radioItemState = MenuRadioItemState.create({
		value: boxWith(() => $$props.value),
		id: boxWith(() => id()),
		disabled: boxWith(() => disabled()),
		onSelect: boxWith(() => handleSelect),
		ref: boxWith(() => ref(), (v) => ref(v)),
		closeOnSelect: boxWith(() => closeOnSelect())
	});

	function handleSelect(e) {
		onSelect()(e);

		if (e.defaultPrevented) return;

		radioItemState.selectValue();
	}

	const mergedProps = $.derived(() => mergeProps(restProps, radioItemState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps), checked: radioItemState.isChecked }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ checked: radioItemState.isChecked }));
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