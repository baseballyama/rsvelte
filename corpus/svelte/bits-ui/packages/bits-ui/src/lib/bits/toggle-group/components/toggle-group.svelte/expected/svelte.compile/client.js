import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { mergeProps } from "svelte-toolbelt";
import { ToggleGroupRootState } from "../toggle-group.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'value',
	'onValueChange',
	'type',
	'disabled',
	'loop',
	'orientation',
	'rovingFocus',
	'child',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Toggle_group($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		disabled = $.prop($$props, 'disabled', 3, false),
		loop = $.prop($$props, 'loop', 3, true),
		orientation = $.prop($$props, 'orientation', 3, "horizontal"),
		rovingFocus = $.prop($$props, 'rovingFocus', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	function handleDefaultValue() {
		if (value() !== undefined) return;

		value($$props.type === "single" ? "" : []);
	}

	// SSR
	handleDefaultValue();

	watch.pre(() => value(), () => {
		handleDefaultValue();
	});

	const rootState = ToggleGroupRootState.create({
		id: boxWith(() => id()),
		value: boxWith(() => value(), (v) => {
			value(v);

			// @ts-expect-error - we know
			onValueChange()(v);
		}),
		disabled: boxWith(() => disabled()),
		loop: boxWith(() => loop()),
		orientation: boxWith(() => orientation()),
		rovingFocus: boxWith(() => rovingFocus()),
		type: $$props.type,
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