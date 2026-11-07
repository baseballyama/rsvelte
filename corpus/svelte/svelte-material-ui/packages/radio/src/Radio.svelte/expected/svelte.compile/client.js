import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { MDCRadioFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'disabled',
	'touch',
	'group',
	'value',
	'valueKey',
	'input$use',
	'input$class'
]);

var root = $.from_html(`<div><input/> <div class="mdc-radio__background"><div class="mdc-radio__outer-circle"></div> <div class="mdc-radio__inner-circle"></div></div> <div class="mdc-radio__ripple"></div></div>`);

export default function Radio($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let uninitializedValue = () => {};

	function isUninitializedValue(value) {
		return value === uninitializedValue;
	}

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
	 * Whether the input is disabled.
	 */
	/**
	 * Whether to use touch styling
	 */
	/**
	 * The value of the currently selected item.
	 */
	/**
	 * The value of the item this radio button represents.
	 */
	/**
	 * A string representation of the value.
	 *
	 * Use this if it can't be converted to a unique string in its group.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		disabled = $.prop($$props, 'disabled', 15, false),
		touch = $.prop($$props, 'touch', 3, false),
		group = $.prop($$props, 'group', 15),
		value = $.prop($$props, 'value', 3, null),
		valueKey = $.prop($$props, 'valueKey', 3, uninitializedValue),
		input$use = $.prop($$props, 'input$use', 19, () => []),
		input$class = $.prop($$props, 'input$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let rippleActive = $.state(false);
	let inputProps = $.proxy(getContext('SMUI:generic:input:props') ?? {});
	const SMUIGenericInputMount = getContext('SMUI:generic:input:mount');
	const SMUIGenericInputUnmount = getContext('SMUI:generic:input:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCRadioFoundation({
				addClass,
				removeClass,
				setNativeControlDisabled: (value) => disabled(value)
			}),
			true
		);

		const accessor = {
			_smui_radio_accessor: true,
			get element() {
				return getElement();
			},

			get checked() {
				return group() === value();
			},

			set checked(checked) {
				if (checked && group() !== value()) {
					group(value());
				} else if (!checked && group() === value()) {
					group(undefined);
				}
			},

			activateRipple() {
				if (!disabled()) {
					$.set(rippleActive, true);
				}
			},

			deactivateRipple() {
				$.set(rippleActive, false);
			}
		};

		SMUIGenericInputMount && SMUIGenericInputMount(accessor);
		$.get(instance).init();

		return () => {
			SMUIGenericInputUnmount && SMUIGenericInputUnmount(accessor);
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function addClass(className) {
		if (!internalClasses[className]) {
			internalClasses[className] = true;
		}
	}

	function removeClass(className) {
		if (!(className in internalClasses) || internalClasses[className]) {
			internalClasses[className] = false;
		}
	}

	function addStyle(name, value) {
		if (internalStyles[name] != value) {
			if (value === '' || value == null) {
				delete internalStyles[name];
			} else {
				internalStyles[name] = value;
			}
		}
	}

	function getId() {
		return inputProps && inputProps.id;
	}

	function getElement() {
		return element;
	}

	var $$exports = { getId, getElement };
	var div = root();

	$.attribute_effect(div, ($0, $1, $2) => ({ class: $0, style: $1, ...$2 }), [
		() => classMap({
			'mdc-radio': true,
			'mdc-radio--disabled': disabled(),
			'mdc-radio--touch': touch(),
			...internalClasses,
			[className()]: true
		}),
		() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '),
		() => exclude(restProps, ['input$'])
	]);

	var input = $.child(div);

	var event_handler = (e) => {
		dispatch(getElement(), 'blur', e);
		$$props.input$onblur?.(e);
	};

	var event_handler_1 = (e) => {
		dispatch(getElement(), 'focus', e);
		$$props.input$onfocus?.(e);
	};

	$.attribute_effect(
		input,
		($0, $1, $2) => ({
			class: $0,
			type: 'radio',
			...inputProps,
			disabled: disabled(),
			value: $1,
			...$2,
			onblur: event_handler,
			onfocus: event_handler_1
		}),
		[
			() => classMap({ 'mdc-radio__native-control': true, [input$class()]: true }),
			() => isUninitializedValue(valueKey()) ? value() : valueKey(),
			() => prefixFilter(restProps, 'input$')
		],
		void 0,
		void 0,
		void 0,
		true
	);

	$.action(input, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), input$use);

	$.effect(() => $.bind_group(
		binding_group,
		[],
		input,
		() => {
			isUninitializedValue(valueKey()) ? value() : valueKey();

			return group();
		},
		group
	));

	$.next(4);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		unbounded: true,
		active: $.get(rippleActive),
		addClass,
		removeClass,
		addStyle
	}));

	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}