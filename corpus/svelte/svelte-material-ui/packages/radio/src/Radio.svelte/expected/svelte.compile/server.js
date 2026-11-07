import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { MDCRadioFoundation } from './mdc';

export default function Radio($$renderer, $$props) {
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
		let {
			use = [],
			class: className = '',
			style = '',
			disabled = false,
			touch = false,
			group = void 0,
			value = null,
			valueKey = uninitializedValue,
			input$use = [],
			input$class = '',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let internalStyles = {};
		let rippleActive = false;
		let inputProps = getContext('SMUI:generic:input:props') ?? {};
		const SMUIGenericInputMount = getContext('SMUI:generic:input:mount');
		const SMUIGenericInputUnmount = getContext('SMUI:generic:input:unmount');

		onMount(() => {
			instance = new MDCRadioFoundation({
				addClass,
				removeClass,
				setNativeControlDisabled: (value) => disabled = value
			});

			const accessor = {
				_smui_radio_accessor: true,
				get element() {
					return getElement();
				},

				get checked() {
					return group === value;
				},

				set checked(checked) {
					if (checked && group !== value) {
						group = value;
					} else if (!checked && group === value) {
						group = undefined;
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

			return () => {
				SMUIGenericInputUnmount && SMUIGenericInputUnmount(accessor);
				instance?.destroy();
				instance = undefined;
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

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-radio': true,
				'mdc-radio--disabled': disabled,
				'mdc-radio--touch': touch,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			...exclude(restProps, ['input$'])
		})}><input${$.attributes(
			{
				class: $.clsx(classMap({ 'mdc-radio__native-control': true, [input$class]: true })),
				type: 'radio',
				...inputProps,
				disabled,
				value: isUninitializedValue(valueKey) ? value : valueKey,
				checked: group === (isUninitializedValue(valueKey) ? value : valueKey),
				...prefixFilter(restProps, 'input$')
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> <div class="mdc-radio__background"><div class="mdc-radio__outer-circle"></div> <div class="mdc-radio__inner-circle"></div></div> <div class="mdc-radio__ripple"></div></div>`);

		$.bind_props($$props, { disabled, group, getId, getElement });
	});
}