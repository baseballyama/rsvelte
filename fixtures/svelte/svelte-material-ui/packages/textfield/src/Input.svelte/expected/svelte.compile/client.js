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
	'type',
	'placeholder',
	'value',
	'files',
	'dirty',
	'invalid',
	'updateInvalid',
	'initialInvalid',
	'emptyValueNull',
	'emptyValueUndefined'
]);

var root = $.from_html(`<input/>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The input type.
	 */
	/**
	 * A placeholder to show when the input is empty.
	 */
	/**
	 * The value of the input.
	 */
	/**
	 * The selected files of the input if it is "file" type.
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
	 * When the value of the input is "", set value prop to null.
	 */
	/**
	 * When the value of the input is "", set value prop to undefined.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		type = $.prop($$props, 'type', 3, 'text'),
		// Always having a placeholder fixes Safari's baseline alignment.
		// See: https://github.com/philipwalton/flexbugs/issues/270
		placeholder = $.prop($$props, 'placeholder', 3, ' '),
		value = $.prop($$props, 'value', 15),
		files = $.prop($$props, 'files', 15, null),
		dirty = $.prop($$props, 'dirty', 15, false),
		invalid = $.prop($$props, 'invalid', 15, false),
		updateInvalid = $.prop($$props, 'updateInvalid', 3, true),
		initialInvalid = $.prop($$props, 'initialInvalid', 3, false),
		emptyValueNull = $.prop($$props, 'emptyValueNull', 19, () => value() === null),
		emptyValueUndefined = $.prop($$props, 'emptyValueUndefined', 19, () => value() === undefined),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalAttrs = $.proxy({});
	let valueProp = $.proxy({});

	$.user_effect(() => {
		if (type() === 'file') {
			delete valueProp.value;
		} else {
			valueProp.value = value() == null ? '' : value();
		}
	});

	onMount(() => {
		if (updateInvalid() && initialInvalid()) {
			invalid(getElement().matches(':invalid'));
		}
	});

	function toNumber(value) {
		if (value === '') {
			return Number.NaN;
		}

		return +value;
	}

	function valueUpdater(e) {
		if (type() === 'file') {
			files(e.currentTarget.files);

			return;
		}

		if (e.currentTarget.value === '' && emptyValueNull()) {
			value(null);

			return;
		}

		if (e.currentTarget.value === '' && emptyValueUndefined()) {
			value(undefined);

			return;
		}

		switch (type()) {
			case 'number':

			case 'range':
				value(toNumber(e.currentTarget.value));
				break;

			default:
				value(e.currentTarget.value);
				break;
		}
	}

	function changeHandler(e) {
		if (type() === 'file' || type() === 'range') {
			valueUpdater(e);
		}

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
	var input = root();

	var event_handler = (e) => {
		if (type() !== 'file') {
			valueUpdater(e);
		}

		$$props.oninput?.(e);
	};

	var event_handler_1 = (e) => {
		changeHandler(e);
		$$props.onchange?.(e);
	};

	$.attribute_effect(
		input,
		($0) => ({
			class: $0,
			type: type(),
			placeholder: placeholder(),
			...valueProp,
			...internalAttrs,
			...restProps,
			oninput: event_handler,
			onchange: event_handler_1
		}),
		[
			() => classMap({ 'mdc-text-field__input': true, [className()]: true })
		],
		void 0,
		void 0,
		void 0,
		true
	);

	$.bind_this(input, ($$value) => element = $$value, () => element);
	$.action(input, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, input);

	return $.pop($$exports);
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The input type.
	 */
	/**
	 * A placeholder to show when the input is empty.
	 */
	/**
	 * The value of the input.
	 */
	/**
	 * The selected files of the input if it is "file" type.
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
	 * When the value of the input is "", set value prop to null.
	 */
	/**
	 * When the value of the input is "", set value prop to undefined.
	 */
	// Always having a placeholder fixes Safari's baseline alignment.
	// See: https://github.com/philipwalton/flexbugs/issues/270
}