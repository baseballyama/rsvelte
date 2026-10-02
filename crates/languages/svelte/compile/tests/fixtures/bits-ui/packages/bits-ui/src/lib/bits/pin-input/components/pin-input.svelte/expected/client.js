import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PinInputRootState } from "../pin-input.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'inputId',
	'ref',
	'inputRef',
	'maxlength',
	'textalign',
	'pattern',
	'inputmode',
	'onComplete',
	'pushPasswordManagerStrategy',
	'class',
	'children',
	'autocomplete',
	'disabled',
	'value',
	'onValueChange',
	'pasteTransformer'
]);

var root = $.from_html(`<div><!> <div><input/></div></div>`);

export default function Pin_input($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		inputId = $.prop($$props, 'inputId', 19, () => `${createId(uid)}-input`),
		ref = $.prop($$props, 'ref', 15, null),
		inputRef = $.prop($$props, 'inputRef', 15, null),
		maxlength = $.prop($$props, 'maxlength', 3, 6),
		textalign = $.prop($$props, 'textalign', 3, "left"),
		inputmode = $.prop($$props, 'inputmode', 3, "numeric"),
		onComplete = $.prop($$props, 'onComplete', 3, noop),
		pushPasswordManagerStrategy = $.prop($$props, 'pushPasswordManagerStrategy', 3, "increase-width"),
		containerClass = $.prop($$props, 'class', 3, ""),
		autocomplete = $.prop($$props, 'autocomplete', 3, "one-time-code"),
		disabled = $.prop($$props, 'disabled', 3, false),
		value = $.prop($$props, 'value', 15, ""),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = PinInputRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		inputRef: boxWith(() => inputRef(), (v) => inputRef(v)),
		inputId: boxWith(() => inputId()),
		autocomplete: boxWith(() => autocomplete()),
		maxLength: boxWith(() => maxlength()),
		textAlign: boxWith(() => textalign()),
		disabled: boxWith(() => disabled()),
		inputmode: boxWith(() => inputmode()),
		pattern: boxWith(() => $$props.pattern),
		onComplete: boxWith(() => onComplete()),
		value: boxWith(() => value(), (v) => {
			value(v);
			onValueChange()(v);
		}),
		pushPasswordManagerStrategy: boxWith(() => pushPasswordManagerStrategy()),
		pasteTransformer: boxWith(() => $$props.pasteTransformer)
	});

	const mergedInputProps = $.derived(() => mergeProps(restProps, rootState.inputProps));
	const mergedRootProps = $.derived(() => mergeProps(rootState.rootProps, { class: containerClass() }));
	const mergedInputWrapperProps = $.derived(() => mergeProps(rootState.inputWrapperProps, {}));
	var div = root();

	$.attribute_effect(div, () => ({ ...$.get(mergedRootProps) }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop, () => rootState.snippetProps);

	var div_1 = $.sibling(node, 2);

	$.attribute_effect(div_1, () => ({ ...$.get(mergedInputWrapperProps) }));

	var input = $.child(div_1);

	$.attribute_effect(input, () => ({ ...$.get(mergedInputProps) }), void 0, void 0, void 0, void 0, true);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}