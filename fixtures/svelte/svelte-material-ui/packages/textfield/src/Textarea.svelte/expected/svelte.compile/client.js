import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'value',
	'dirty',
	'invalid',
	'updateInvalid',
	'initialInvalid',
	'resizable'
]);

var root = $.from_html(`<textarea></textarea>`);

export default function Textarea($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A list of CSS styles.
	 */
	/**
	 * The value of the input.
	 */
	/**
	 * Whether the input has been changed.
	 */
	/**
	 * Whether the input is invalid.
	 */
	/**
	 * Set to false to prevent updating the value passed to invalid.
	 */
	/**
	 * Set to true to update the invalid state immediately on instantiation.
	 */
	/**
	 * Whether the textarea should be user resizeable.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		value = $.prop($$props, 'value', 15, ''),
		dirty = $.prop($$props, 'dirty', 15, false),
		invalid = $.prop($$props, 'invalid', 15, false),
		updateInvalid = $.prop($$props, 'updateInvalid', 3, true),
		initialInvalid = $.prop($$props, 'initialInvalid', 3, false),
		resizable = $.prop($$props, 'resizable', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalAttrs = $.proxy({});

	onMount(() => {
		if (updateInvalid() && initialInvalid()) {
			invalid(getElement().matches(':invalid'));
		}
	});

	function changeHandler() {
		dirty(true);

		if (updateInvalid()) {
			invalid(getElement().matches(':invalid'));
		}
	}

	function getAttr(name) {
		return name in internalAttrs
			? internalAttrs[name] ?? null
			: getElement().getAttribute(name);
	}

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
		}
	}

	function removeAttr(name) {
		if (!(name in internalAttrs) || internalAttrs[name] != null) {
			internalAttrs[name] = undefined;
		}
	}

	function focus() {
		getElement().focus();
	}

	function blur() {
		getElement().blur();
	}

	function getElement() {
		return element;
	}

	var $$exports = { getAttr, addAttr, removeAttr, focus, blur, getElement };
	var textarea = root();

	$.remove_textarea_child(textarea);

	var event_handler = (e) => {
		changeHandler();
		$$props.onchange?.(e);
	};

	$.attribute_effect(
		textarea,
		($0) => ({
			class: $0,
			style: `${resizable() ? '' : 'resize: none; '}${style()}`,
			...internalAttrs,
			...restProps,
			onchange: event_handler
		}),
		[
			() => classMap({ 'mdc-text-field__input': true, [className()]: true })
		]
	);

	$.bind_this(textarea, ($$value) => element = $$value, () => element);
	$.action(textarea, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.effect(() => $.bind_value(textarea, value));
	$.append($$anchor, textarea);

	return $.pop($$exports);
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A list of CSS styles.
	 */
	/**
	 * The value of the input.
	 */
	/**
	 * Whether the input has been changed.
	 */
	/**
	 * Whether the input is invalid.
	 */
	/**
	 * Set to false to prevent updating the value passed to invalid.
	 */
	/**
	 * Set to true to update the invalid state immediately on instantiation.
	 */
	/**
	 * Whether the textarea should be user resizeable.
	 */
}