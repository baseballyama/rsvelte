import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { RatingGroupRootState } from "../rating-group.svelte.js";
import RatingGroupInput from "./rating-group-input.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'disabled',
	'children',
	'child',
	'value',
	'ref',
	'orientation',
	'name',
	'required',
	'min',
	'max',
	'allowHalf',
	'readonly',
	'id',
	'onValueChange',
	'aria-label',
	'aria-valuetext',
	'hoverPreview'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Rating_group($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		value = $.prop($$props, 'value', 15, 0),
		ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, "horizontal"),
		name = $.prop($$props, 'name', 3, undefined),
		required = $.prop($$props, 'required', 3, false),
		min = $.prop($$props, 'min', 3, 0),
		max = $.prop($$props, 'max', 3, 5),
		allowHalf = $.prop($$props, 'allowHalf', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		hoverPreview = $.prop($$props, 'hoverPreview', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	if (value() < min() || value() > max()) {
		value(Math.max(min(), Math.min(max(), value())));
	}

	const ariaValuetext = $.derived(() => {
		if ($$props['aria-valuetext']) return $$props['aria-valuetext'];

		return (value, max) => `${value} out of ${max}`;
	});

	const rootState = RatingGroupRootState.create({
		orientation: boxWith(() => orientation()),
		disabled: boxWith(() => disabled()),
		name: boxWith(() => name()),
		required: boxWith(() => required()),
		min: boxWith(() => min()),
		max: boxWith(() => max()),
		allowHalf: boxWith(() => allowHalf()),
		readonly: boxWith(() => readonly()),
		id: boxWith(() => id()),
		value: boxWith(() => value(), (v) => {
			if (v === value()) return;

			value(v);
			onValueChange()?.(v);
		}),
		ref: boxWith(() => ref(), (v) => ref(v)),
		ariaValuetext: boxWith(() => $.get(ariaValuetext)),
		hoverPreview: boxWith(() => hoverPreview())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props, { "aria-label": $$props['aria-label'] }));
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...rootState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => rootState.snippetProps);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_3 = $.sibling(node, 2);

	RatingGroupInput(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}