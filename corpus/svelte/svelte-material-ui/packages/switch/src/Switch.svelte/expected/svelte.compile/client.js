import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { MDCSwitchRenderFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'disabled',
	'focusRing',
	'color',
	'group',
	'checked',
	'value',
	'processing',
	'icons',
	'icons$use',
	'icons$class'
]);

var root = $.from_html(`<div><svg class="mdc-switch__icon mdc-switch__icon--on" viewBox="0 0 24 24"><path d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"></path></svg> <svg class="mdc-switch__icon mdc-switch__icon--off" viewBox="0 0 24 24"><path d="M20 13H4v-2h16v2z"></path></svg></div>`);
var root_1 = $.from_html(`<div class="mdc-switch__focus-ring-wrapper"><div class="mdc-switch__focus-ring"></div></div>`);
var root_2 = $.from_html(`<button><div class="mdc-switch__track"></div> <div class="mdc-switch__handle-track"><div class="mdc-switch__handle"><div class="mdc-switch__shadow"><div class="mdc-elevation-overlay"></div></div> <div class="mdc-switch__ripple"></div> <!></div></div> <!></button>`);

export default function Switch($$anchor, $$props) {
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
	 * Whether the input is disabled.
	 */
	/**
	 * Whether to show a focus fing.
	 */
	/**
	 * The color of the switch.
	 */
	/**
	 * An array of items to pick from.
	 *
	 * If the switch is in a group, the values for the checked items will be
	 * added to the array passed in the `value` prop.
	 */
	/**
	 * Whether the switch is checked.
	 */
	/**
	 * An array of currently selected values.
	 *
	 * This is the array that is added to/taken from when the switch is in a
	 * group.
	 */
	/**
	 * This currently does nothing.
	 */
	/**
	 * Whether to show icons.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		disabled = $.prop($$props, 'disabled', 15, false),
		focusRing = $.prop($$props, 'focusRing', 3, false),
		color = $.prop($$props, 'color', 3, 'primary'),
		group = $.prop($$props, 'group', 11, uninitializedValue),
		checked = $.prop($$props, 'checked', 15, uninitializedValue),
		value = $.prop($$props, 'value', 3, null),
		processing = $.prop($$props, 'processing', 7, false),
		icons = $.prop($$props, 'icons', 3, true),
		icons$use = $.prop($$props, 'icons$use', 19, () => []),
		icons$class = $.prop($$props, 'icons$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let rippleElement = $.state(void 0);
	let rippleActive = $.state(false);
	let inputProps = $.proxy(getContext('SMUI:generic:input:props') ?? {});

	let selected = $.state($.proxy(isUninitializedValue(group())
		? isUninitializedValue(checked()) ? false : checked()
		: group().findIndex((val) => val === value()) !== -1));

	let switchState = {
		get disabled() {
			return disabled();
		},

		set disabled(value) {
			disabled(value);
		},

		get processing() {
			return processing();
		},

		set processing(value) {
			processing(value);
		},

		get selected() {
			return $.get(selected);
		},

		set selected(value) {
			$.set(selected, value, true);
		}
	};

	let previousChecked = checked();
	let previousGroup = isUninitializedValue(group()) ? [] : [...group()];
	let previousSelected = $.get(selected);

	$.user_effect(() => {
		// This is a substitute for an onchange listener that is
		// smarter about when it calls the instance's handler. I do
		// this so that a group of changes will only trigger one
		// handler call, since the handler will reset currently
		// running animations.
		let notifyChange = false;

		// First check for group state.
		if (!isUninitializedValue(group())) {
			if (previousSelected !== $.get(selected)) {
				// The change needs to flow up.
				const idx = group().findIndex((val) => val === value());

				if ($.get(selected) && idx === -1) {
					group().push(value());
				} else if (!$.get(selected) && idx !== -1) {
					group().splice(idx, 1);
				}

				notifyChange = true;
			} else {
				// Potential changes need to flow down.
				const idxPrev = previousGroup.findIndex((val) => val === value());

				const idx = group().findIndex((val) => val === value());

				if (idxPrev > -1 && idx === -1) {
					// The checkbox was removed from the group.
					switchState.selected = false;
				} else if (idx > -1 && idxPrev === -1) {
					// The checkbox was added to the group.
					switchState.selected = true;
				}
			}
		}

		// Now check individual state.
		if (isUninitializedValue(checked())) {
			if (previousSelected !== $.get(selected)) {
				// The checkbox was clicked by the user.
				notifyChange = true;
			}
		} else if (checked() !== $.get(selected)) {
			if (checked() === previousChecked) {
				// The checkbox was clicked by the user
				// and the change needs to flow up.
				checked($.get(selected));

				notifyChange = true;
			} else {
				// The checkbox was changed programmatically
				// and the change needs to flow down.
				switchState.selected = checked();
			}
		}

		previousChecked = checked();
		previousGroup = isUninitializedValue(group()) ? [] : [...group()];
		previousSelected = $.get(selected);

		if (notifyChange && getElement()) {
			dispatch(getElement(), 'SMUISwitchChange', { selected: $.get(selected), value: value() });
		}
	});

	const SMUIGenericInputMount = getContext('SMUI:generic:input:mount');
	const SMUIGenericInputUnmount = getContext('SMUI:generic:input:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCSwitchRenderFoundation({
				addClass,
				hasClass,
				isDisabled: () => disabled(),
				removeClass,
				setAriaChecked: () => {
					// Handled automatically.
				},

				setDisabled: (value) => {
					disabled(value);
				},
				state: switchState
			}),
			true
		);

		const accessor = {
			get element() {
				return getElement();
			},

			get checked() {
				return $.get(selected);
			},

			set checked(checked) {
				if ($.get(selected) !== checked) {
					switchState.selected = checked;

					if (getElement()) {
						dispatch(getElement(), 'SMUISwitchChange', { selected: checked, value: value() });
					}
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
		$.get(instance).initFromDOM();

		return () => {
			SMUIGenericInputUnmount && SMUIGenericInputUnmount(accessor);
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function hasClass(className) {
		return className in internalClasses
			? internalClasses[className]
			: getElement().classList.contains(className);
	}

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

	function getId() {
		return inputProps && inputProps.id;
	}

	function getElement() {
		return element;
	}

	var $$exports = { getId, getElement };
	var button = root_2();

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleClick();
		}

		$$props.onclick?.(e);
	};

	$.attribute_effect(
		button,
		($0, $1) => ({
			class: $0,
			type: 'button',
			role: 'switch',
			'aria-checked': $.get(selected) ? 'true' : 'false',
			disabled: disabled(),
			...inputProps,
			...$1,
			onclick: event_handler
		}),
		[
			() => classMap({
				'mdc-switch': true,
				'mdc-switch--unselected': !$.get(selected),
				'mdc-switch--selected': $.get(selected),
				'mdc-switch--processing': processing(),
				'smui-switch--color-secondary': color() === 'secondary',
				...internalClasses,
				[className()]: true
			}),
			() => exclude(restProps, ['icons$'])
		]
	);

	var div = $.sibling($.child(button), 2);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);

	$.bind_this(div_2, ($$value) => $.set(rippleElement, $$value), () => $.get(rippleElement));

	var node = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();

			$.attribute_effect(div_3, ($0, $1) => ({ class: $0, ...$1 }), [
				() => classMap({ 'mdc-switch__icons': true, [icons$class()]: true }),
				() => prefixFilter(restProps, 'icons$')
			]);

			$.action(div_3, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), icons$use);
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if (icons()) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_1();

			$.append($$anchor, div_4);
		};

		$.if(node_1, ($$render) => {
			if (focusRing()) $$render(consequent_1);
		});
	}

	$.reset(button);
	$.bind_this(button, ($$value) => element = $$value, () => element);
	$.action(button, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		unbounded: true,
		color: color(),
		active: $.get(rippleActive),
		rippleElement: $.get(rippleElement),
		disabled: disabled(),
		addClass,
		removeClass
	}));

	$.append($$anchor, button);

	return $.pop($$exports);
}