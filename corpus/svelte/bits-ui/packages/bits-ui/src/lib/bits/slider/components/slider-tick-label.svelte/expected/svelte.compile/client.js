import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SliderRootContext, SliderTickLabelState } from "../slider.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'ref',
	'id',
	'index',
	'position'
]);

var root_1 = $.from_html(`<span><!></span>`);

export default function Slider_tick_label($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		restProps = $.rest_props($$props, rest_excludes);

	const root = SliderRootContext.get();

	const position = $.derived(() => {
		if ($$props.position !== undefined) return $$props.position;

		switch (root.direction) {
			case "lr":

			case "rl":
				return "top";

			case "tb":

			case "bt":
				return "left";
		}
	});

	const tickLabelState = SliderTickLabelState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		index: boxWith(() => $$props.index),
		position: boxWith(() => $.get(position))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, tickLabelState.props));
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
			var span = root_1();

			$.attribute_effect(span, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(span);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}