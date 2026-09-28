import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { MDCSwitchRenderFoundation } from './mdc';

export default function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			use = [],
			class: className = '',
			disabled = false,
			focusRing = false,
			color = 'primary',
			group = uninitializedValue,
			checked = uninitializedValue,
			value = null,
			processing = false,
			icons = true,
			icons$use = [],
			icons$class = '',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let rippleElement = void 0;
		let rippleActive = false;
		let inputProps = getContext('SMUI:generic:input:props') ?? {};

		let selected = isUninitializedValue(group)
			? isUninitializedValue(checked) ? false : checked
			: group.findIndex((val) => val === value) !== -1;

		let switchState = {
			get disabled() {
				return disabled;
			},

			set disabled(value) {
				disabled = value;
			},

			get processing() {
				return processing;
			},

			set processing(value) {
				processing = value;
			},

			get selected() {
				return selected;
			},

			set selected(value) {
				selected = value;
			}
		};

		let previousChecked = checked;
		let previousGroup = isUninitializedValue(group) ? [] : [...group];
		let previousSelected = selected;

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
		const SMUIGenericInputMount = getContext('SMUI:generic:input:mount');

		const SMUIGenericInputUnmount = getContext('SMUI:generic:input:unmount');

		onMount(() => {
			instance = new MDCSwitchRenderFoundation({
				addClass,
				hasClass,
				isDisabled: () => disabled,
				removeClass,
				setAriaChecked: () => {
					// Handled automatically.
				},

				setDisabled: (value) => {
					disabled = value;
				},
				state: switchState
			});

			const accessor = {
				get element() {
					return getElement();
				},

				get checked() {
					return selected;
				},

				set checked(checked) {
					if (selected !== checked) {
						switchState.selected = checked;

						if (getElement()) {
							dispatch(getElement(), 'SMUISwitchChange', { selected: checked, value });
						}
					}
				},

				activateRipple() {
					if (!disabled) {
						rippleActive = true;
					}
				},

				deactivateRipple() {
					rippleActive = false;
				}
			};

			SMUIGenericInputMount && SMUIGenericInputMount(accessor);
			instance.init();
			instance.initFromDOM();

			return () => {
				SMUIGenericInputUnmount && SMUIGenericInputUnmount(accessor);
				instance?.destroy();
				instance = undefined;
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

		$$renderer.push(`<button${$.attributes({
			class: $.clsx(classMap({
				'mdc-switch': true,
				'mdc-switch--unselected': !selected,
				'mdc-switch--selected': selected,
				'mdc-switch--processing': processing,
				'smui-switch--color-secondary': color === 'secondary',
				...internalClasses,
				[className]: true
			})),
			type: 'button',
			role: 'switch',
			'aria-checked': selected ? 'true' : 'false',
			disabled,
			...inputProps,
			...exclude(restProps, ['icons$'])
		})}><div class="mdc-switch__track"></div> <div class="mdc-switch__handle-track"><div class="mdc-switch__handle"><div class="mdc-switch__shadow"><div class="mdc-elevation-overlay"></div></div> <div class="mdc-switch__ripple"></div> `);

		if (icons) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				class: $.clsx(classMap({ 'mdc-switch__icons': true, [icons$class]: true })),
				...prefixFilter(restProps, 'icons$')
			})}><svg class="mdc-switch__icon mdc-switch__icon--on" viewBox="0 0 24 24"><path d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"></path></svg> <svg class="mdc-switch__icon mdc-switch__icon--off" viewBox="0 0 24 24"><path d="M20 13H4v-2h16v2z"></path></svg></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (focusRing) {
			$$renderer.push(`<!--[0--><div class="mdc-switch__focus-ring-wrapper"><div class="mdc-switch__focus-ring"></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></button>`);
		$.bind_props($$props, { disabled, group, checked, getId, getElement });
	});
}