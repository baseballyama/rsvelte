import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { MDCCheckboxFoundation } from './mdc';

export default function Checkbox($$renderer, $$props) {
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
		let {
			use = [],
			class: className = '',
			style = '',
			disabled = false,
			touch = false,
			indeterminate = uninitializedValue,
			group = uninitializedValue,
			checked = uninitializedValue,
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
		let checkbox = void 0;
		let internalClasses = {};
		let internalStyles = {};
		let nativeControlAttrs = {};
		let rippleActive = false;
		let inputProps = getContext('SMUI:generic:input:props') ?? {};

		let nativeChecked = isUninitializedValue(group)
			? isUninitializedValue(checked) ? false : !!checked
			: group.findIndex((val) => val === value) !== -1;

		let context = getContext('SMUI:checkbox:context');
		let dataTableHeader = getContext('SMUI:data-table:row:header');
		let previousChecked = checked;
		let previousGroup = isUninitializedValue(group) ? [] : [...group];
		let previousNativeChecked = nativeChecked;

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
		const SMUIGenericInputMount = getContext('SMUI:generic:input:mount');

		const SMUIGenericInputUnmount = getContext('SMUI:generic:input:unmount');
		const SMUICheckboxMount = getContext('SMUI:checkbox:mount');
		const SMUICheckboxUnmount = getContext('SMUI:checkbox:unmount');

		onMount(() => {
			if (checkbox == null) {
				throw new Error('Checkbox is not defined.');
			}

			checkbox.indeterminate = !isUninitializedValue(indeterminate) && indeterminate;

			instance = new MDCCheckboxFoundation({
				addClass,
				forceLayout: () => getElement().offsetWidth,
				hasNativeControl: () => true,
				isAttachedToDOM: () => Boolean(getElement().parentNode),
				isChecked: () => nativeChecked,
				isIndeterminate: () => isUninitializedValue(indeterminate) ? false : indeterminate,
				removeClass,
				removeNativeControlAttr,
				setNativeControlAttr: addNativeControlAttr,
				setNativeControlDisabled: (value) => disabled = value
			});

			const accessor = {
				_smui_checkbox_accessor: true,
				get element() {
					return getElement();
				},

				get checked() {
					return nativeChecked;
				},

				set checked(value) {
					if (nativeChecked !== value) {
						nativeChecked = value;
					}
				},

				get indeterminate() {
					return isUninitializedValue(indeterminate) ? false : indeterminate;
				},

				set indeterminate(value) {
					indeterminate = value;
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
			SMUICheckboxMount && SMUICheckboxMount(accessor);
			instance.init();

			return () => {
				SMUIGenericInputUnmount && SMUIGenericInputUnmount(accessor);
				SMUICheckboxUnmount && SMUICheckboxUnmount(accessor);
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

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-checkbox': true,
				'mdc-checkbox--disabled': disabled,
				'mdc-checkbox--touch': touch,
				'mdc-data-table__header-row-checkbox': context === 'data-table' && dataTableHeader,
				'mdc-data-table__row-checkbox': context === 'data-table' && !dataTableHeader,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			...exclude(restProps, ['input$'])
		})}><input${$.attributes(
			{
				class: $.clsx(classMap({ 'mdc-checkbox__native-control': true, [input$class]: true })),
				type: 'checkbox',
				...inputProps,
				disabled,
				value: isUninitializedValue(valueKey) ? value : valueKey,
				checked: nativeChecked,
				'data-indeterminate': !isUninitializedValue(indeterminate) && indeterminate ? 'true' : undefined,
				...nativeControlAttrs,
				...prefixFilter(restProps, 'input$')
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> <div class="mdc-checkbox__background"><svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"></path></svg> <div class="mdc-checkbox__mixedmark"></div></div> <div class="mdc-checkbox__ripple"></div></div>`);

		$.bind_props($$props, { disabled, indeterminate, group, checked, getId, getElement });
	});
}