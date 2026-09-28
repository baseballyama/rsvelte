import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ToggleRootState } from "../toggle.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'pressed',
	'onPressedChange',
	'disabled',
	'type',
	'children',
	'child'
]);

var root = $.from_html(`<button><!></button>`);

export default function Toggle($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		pressed = $.prop($$props, 'pressed', 15, false),
		onPressedChange = $.prop($$props, 'onPressedChange', 3, noop),
		disabled = $.prop($$props, 'disabled', 3, false),
		type = $.prop($$props, 'type', 3, "button"),
		restProps = $.rest_props($$props, rest_excludes);

	const toggleState = ToggleRootState.create({
		pressed: boxWith(() => pressed(), (v) => {
			pressed(v);
			onPressedChange()(v);
		}),
		disabled: boxWith(() => disabled() ?? false),
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, toggleState.props, { type: type() }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...toggleState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(button);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => toggleState.snippetProps);
			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}