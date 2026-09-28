import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { MDCCheckboxFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'disabled',
	'touch',
	'indeterminate',
	'group',
	'checked',
	'value',
	'valueKey',
	'input$use',
	'input$class'
]);

var root = $.from_html(`<div><input/> <div class="mdc-checkbox__background"><svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"></path></svg> <div class="mdc-checkbox__mixedmark"></div></div> <div class="mdc-checkbox__ripple"></div></div>`);

export default function Checkbox($$anchor, $$props) {
	$.push($$props, true);

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
	 * Whether the checkbox is in an indeterminate state.
	 */
	/**
	 * An array of items to pick from.
	 *
	 * If the checkbox is in a group, the values for the checked items will be
	 * added to the array passed in the `value` prop.
	 */
	/**
	 * Whether the box is checked.
	 */
	/**
	 * An array of currently selected values.
	 *
	 * This is the array that is added to/taken from when the checkbox is in a
	 * group.
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
		indeterminate = $.prop($$props, 'indeterminate', 15, uninitializedValue),
		group = $.prop($$props, 'group', 11, uninitializedValue),
		checked = $.prop($$props, 'checked', 15, uninitializedValue),
		value = $.prop($$props, 'value', 3, null),
		valueKey = $.prop($$props, 'valueKey', 3, uninitializedValue),
		input$use = $.prop($$props, 'input$use', 19, () => []),
		input$class = $.prop($$props, 'input$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let checkbox = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let nativeControlAttrs = $.proxy({});
	let rippleActive = $.state(false);
	let inputProps = $.proxy(getContext('SMUI:generic:input:props') ?? {});

	let nativeChecked = $.state($.proxy(isUninitializedValue(group())
		? isUninitializedValue(checked()) ? false : !!checked()
		: group().findIndex((val) => val === value()) !== -1));

	let context = getContext('SMUI:checkbox:context');
	let dataTableHeader = getContext('SMUI:data-table:row:header');
	let previousChecked = checked();
	let previousGroup = isUninitializedValue(group()) ? [] : [...group()];
	let previousNativeChecked = $.get(nativeChecked);

	$.user_effect(() => {
		// This is a substitute for an onchange listener that is
		// smarter about when it calls the instance's handler. I do
		// this so that a group of changes will only trigger one
		// handler call, since the handler will reset currently
		// running animations.
		let callHandleChange = false;

		// First check for group state.
		if (!isUninitializedValue(group())) {
			if (previousNativeChecked !== $.get(nativeChecked)) {
				// The change needs to flow up.
				const idx = group().findIndex((val) => val === value());

				if ($.get(nativeChecked) && idx === -1) {
					group().push(value());
				} else if (!$.get(nativeChecked) && idx !== -1) {
					group().splice(idx, 1);
				}

				callHandleChange = true;
			} else {
				// Potential changes need to flow down.
				const idxPrev = previousGroup.findIndex((val) => val === value());

				const idx = group().findIndex((val) => val === value());

				if (idxPrev > -1 && idx === -1) {
					// The checkbox was removed from the group.
					$.set(nativeChecked, false);

					callHandleChange = true;
				} else if (idx > -1 && idxPrev === -1) {
					// The checkbox was added to the group.
					$.set(nativeChecked, true);

					callHandleChange = true;
				}
			}
		}

		// Now check individual state.
		if (isUninitializedValue(checked())) {
			if (previousNativeChecked !== $.get(nativeChecked)) {
				// The checkbox was clicked by the user.
				callHandleChange = true;
			}
		} else if (checked() !== (indeterminate() ? null : $.get(nativeChecked)) || $.get(nativeChecked) !== previousNativeChecked) {
			if (checked() === previousChecked && $.get(nativeChecked) !== previousNativeChecked) {
				// The checkbox was clicked by the user
				// and the change needs to flow up.
				checked($.get(nativeChecked));

				if (!isUninitializedValue(indeterminate())) {
					indeterminate(false);
				}
			} else {
				// The checkbox was changed programmatically
				// and the change needs to flow down.
				$.set(nativeChecked, !!checked());
			}

			callHandleChange = true;
		}

		if ($.get(checkbox)) {
			// Sync indeterminate state with the native input.
			if (isUninitializedValue(indeterminate())) {
				if ($.get(checkbox).indeterminate) {
					// I don't think this can happen, but just in case.
					$.get(checkbox).indeterminate = false;

					callHandleChange = true;
				}
			} else {
				if (!indeterminate() && $.get(checkbox).indeterminate) {
					$.get(checkbox).indeterminate = false;
					callHandleChange = true;
				} else if (indeterminate() && !$.get(checkbox).indeterminate) {
					$.get(checkbox).indeterminate = true;
					$.set(nativeChecked, false);
					callHandleChange = true;
				}
			}
		}

		previousChecked = checked();
		previousGroup = isUninitializedValue(group()) ? [] : [...group()];
		previousNativeChecked = $.get(nativeChecked);

		if (callHandleChange && $.get(instance)) {
			$.get(instance).handleChange();
		}
	});

	const SMUIGenericInputMount = getContext('SMUI:generic:input:mount');
	const SMUIGenericInputUnmount = getContext('SMUI:generic:input:unmount');
	const SMUICheckboxMount = getContext('SMUI:checkbox:mount');
	const SMUICheckboxUnmount = getContext('SMUI:checkbox:unmount');

	onMount(() => {
		if ($.get(checkbox) == null) {
			throw new Error('Checkbox is not defined.');
		}

		$.get(checkbox).indeterminate = !isUninitializedValue(indeterminate()) && indeterminate();

		$.set(
			instance,
			new MDCCheckboxFoundation({
				addClass,
				forceLayout: () => getElement().offsetWidth,
				hasNativeControl: () => true,
				isAttachedToDOM: () => Boolean(getElement().parentNode),
				isChecked: () => $.get(nativeChecked),
				isIndeterminate: () => isUninitializedValue(indeterminate()) ? false : indeterminate(),
				removeClass,
				removeNativeControlAttr,
				setNativeControlAttr: addNativeControlAttr,
				setNativeControlDisabled: (value) => disabled(value)
			}),
			true
		);

		const accessor = {
			_smui_checkbox_accessor: true,
			get element() {
				return getElement();
			},

			get checked() {
				return $.get(nativeChecked);
			},

			set checked(value) {
				if ($.get(nativeChecked) !== value) {
					$.set(nativeChecked, value, true);
				}
			},

			get indeterminate() {
				return isUninitializedValue(indeterminate()) ? false : indeterminate();
			},

			set indeterminate(value) {
				indeterminate(value);
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
		SMUICheckboxMount && SMUICheckboxMount(accessor);
		$.get(instance).init();

		return () => {
			SMUIGenericInputUnmount && SMUIGenericInputUnmount(accessor);
			SMUICheckboxUnmount && SMUICheckboxUnmount(accessor);
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

	function addNativeControlAttr(name, value) {
		if (nativeControlAttrs[name] !== value) {
			nativeControlAttrs[name] = value;
		}
	}

	function removeNativeControlAttr(name) {
		if (!(name in nativeControlAttrs) || nativeControlAttrs[name] != null) {
			nativeControlAttrs[name] = undefined;
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

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleAnimationEnd();
		}

		$$props.onanimationend?.(e);
	};

	$.attribute_effect(div, ($0, $1, $2) => ({ class: $0, style: $1, ...$2, onanimationend: event_handler }), [
		() => classMap({
			'mdc-checkbox': true,
			'mdc-checkbox--disabled': disabled(),
			'mdc-checkbox--touch': touch(),
			'mdc-data-table__header-row-checkbox': context === 'data-table' && dataTableHeader,
			'mdc-data-table__row-checkbox': context === 'data-table' && !dataTableHeader,
			...internalClasses,
			[className()]: true
		}),
		() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '),
		() => exclude(restProps, ['input$'])
	]);

	var input = $.child(div);

	var event_handler_1 = (e) => {
		dispatch(getElement(), 'blur', e);
		$$props.input$onblur?.(e);
	};

	var event_handler_2 = (e) => {
		dispatch(getElement(), 'focus', e);
		$$props.input$onfocus?.(e);
	};

	$.attribute_effect(
		input,
		($0, $1, $2, $3) => ({
			class: $0,
			type: 'checkbox',
			...inputProps,
			disabled: disabled(),
			value: $1,
			'data-indeterminate': $2,
			...nativeControlAttrs,
			...$3,
			onblur: event_handler_1,
			onfocus: event_handler_2
		}),
		[
			() => classMap({ 'mdc-checkbox__native-control': true, [input$class()]: true }),
			() => isUninitializedValue(valueKey()) ? value() : valueKey(),
			() => !isUninitializedValue(indeterminate()) && indeterminate() ? 'true' : undefined,
			() => prefixFilter(restProps, 'input$')
		],
		void 0,
		void 0,
		void 0,
		true
	);

	$.bind_this(input, ($$value) => $.set(checkbox, $$value), () => $.get(checkbox));
	$.action(input, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), input$use);
	$.effect(() => $.bind_checked(input, () => $.get(nativeChecked), ($$value) => $.set(nativeChecked, $$value)));
	$.next(4);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		unbounded: true,
		addClass,
		removeClass,
		addStyle,
		active: $.get(rippleActive),
		eventTarget: $.get(checkbox)
	}));

	$.append($$anchor, div);

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
	 * Whether the input is disabled.
	 */
	/**
	 * Whether to use touch styling
	 */
	/**
	 * Whether the checkbox is in an indeterminate state.
	 */
	/**
	 * An array of items to pick from.
	 *
	 * If the checkbox is in a group, the values for the checked items will be
	 * added to the array passed in the `value` prop.
	 */
	/**
	 * Whether the box is checked.
	 */
	/**
	 * An array of currently selected values.
	 *
	 * This is the array that is added to/taken from when the checkbox is in a
	 * group.
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
	// This is a substitute for an onchange listener that is
	// smarter about when it calls the instance's handler. I do
	// this so that a group of changes will only trigger one
	// handler call, since the handler will reset currently
	// running animations.
	// First check for group state.
	// The change needs to flow up.
	// Potential changes need to flow down.
	// The checkbox was removed from the group.
	// The checkbox was added to the group.
	// Now check individual state.
	// The checkbox was clicked by the user.
	// The checkbox was clicked by the user
	// and the change needs to flow up.
	// The checkbox was changed programmatically
	// and the change needs to flow down.
	// Sync indeterminate state with the native input.
	// I don't think this can happen, but just in case.
}