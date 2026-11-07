import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { AccordionRootState } from "../accordion.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'disabled',
	'children',
	'child',
	'type',
	'value',
	'ref',
	'id',
	'onValueChange',
	'loop',
	'orientation'
]);

var root = $.from_html(`<div><!></div>`);

export default function Accordion($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		value = $.prop($$props, 'value', 15),
		ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		loop = $.prop($$props, 'loop', 3, true),
		orientation = $.prop($$props, 'orientation', 3, "vertical"),
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

	const rootState = AccordionRootState.create({
		type: $$props.type,
		value: boxWith(() => value(), (v) => {
			value(v);

			// oxlint-disable-next-line no-explicit-any
			onValueChange()(v);
		}),
		id: boxWith(() => id()),
		disabled: boxWith(() => disabled()),
		loop: boxWith(() => loop()),
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