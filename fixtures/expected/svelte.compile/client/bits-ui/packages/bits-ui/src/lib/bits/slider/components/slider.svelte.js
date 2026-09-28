import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SliderRootState } from "../slider.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'id',
	'ref',
	'value',
	'type',
	'onValueChange',
	'onValueCommit',
	'disabled',
	'min',
	'max',
	'step',
	'dir',
	'autoSort',
	'orientation',
	'thumbPositioning',
	'trackPadding'
]);

var root = $.from_html(`<span><!></span>`);

export default function Slider($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		onValueCommit = $.prop($$props, 'onValueCommit', 3, noop),
		disabled = $.prop($$props, 'disabled', 3, false),
		step = $.prop($$props, 'step', 3, 1),
		dir = $.prop($$props, 'dir', 3, "ltr"),
		autoSort = $.prop($$props, 'autoSort', 3, true),
		orientation = $.prop($$props, 'orientation', 3, "horizontal"),
		thumbPositioning = $.prop($$props, 'thumbPositioning', 3, "contain"),
		restProps = $.rest_props($$props, rest_excludes);

	const min = $.derived(() => {
		if ($$props.min !== undefined) return $$props.min;
		if (Array.isArray(step())) return Math.min(...step());

		return 0;
	});

	const max = $.derived(() => {
		if ($$props.max !== undefined) return $$props.max;
		if (Array.isArray(step())) return Math.max(...step());

		return 100;
	});

	function handleDefaultValue() {
		if (value() !== undefined) return;

		if ($$props.type === "single") {
			return $.get(min);
		}

		return [];
	}

	// SSR
	handleDefaultValue();

	watch.pre(() => value(), () => {
		handleDefaultValue();
	});

	const rootState = SliderRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		value: boxWith(() => value(), (v) => {
			value(v);

			// @ts-expect-error - we know
			onValueChange()(v);
		}),

		// @ts-expect-error - we know
		onValueCommit: boxWith(() => onValueCommit()),
		disabled: boxWith(() => disabled()),
		min: boxWith(() => $.get(min)),
		max: boxWith(() => $.get(max)),
		step: boxWith(() => step()),
		dir: boxWith(() => dir()),
		autoSort: boxWith(() => autoSort()),
		orientation: boxWith(() => orientation()),
		thumbPositioning: boxWith(() => thumbPositioning()),
		type: $$props.type,
		trackPadding: boxWith(() => $$props.trackPadding)
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));
	var fragment = $.comment();
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
			var span = root();

			$.attribute_effect(span, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(span);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => rootState.snippetProps);
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