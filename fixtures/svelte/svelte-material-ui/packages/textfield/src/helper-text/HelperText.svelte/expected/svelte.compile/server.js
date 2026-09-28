import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCTextFieldHelperTextFoundation } from './mdc';

let counter = 0;

export default function HelperText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The ID of the element.
		 */
		/**
		 * Whether the validation helper text persists even if the input is valid.
		 *
		 * If it is, it will be displayed in the normal (grey) color.
		 */
		/**
		 * Whether the helper text acts as a validation message.
		 */
		let {
			use = [],
			class: className = '',
			id = 'SMUI-textfield-helper-text-' + counter++,
			persistent = false,
			validationMsg = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let internalAttrs = {};
		let content = void 0;
		const SMUITextfieldHelperTextId = getContext('SMUI:textfield:helper-text:id');
		const SMUITextfieldHelperTextMount = getContext('SMUI:textfield:helper-text:mount');
		const SMUITextfieldHelperTextUnmount = getContext('SMUI:textfield:helper-text:unmount');

		onMount(() => {
			instance = new MDCTextFieldHelperTextFoundation({
				addClass,
				removeClass,
				hasClass,
				getAttr,
				setAttr: addAttr,
				removeAttr,
				setContent: (value) => {
					content = value;
				}
			});

			SMUITextfieldHelperTextId && SMUITextfieldHelperTextId(id);
			SMUITextfieldHelperTextMount && SMUITextfieldHelperTextMount(instance);
			instance.init();

			return () => {
				if (SMUITextfieldHelperTextUnmount && instance) {
					SMUITextfieldHelperTextUnmount(instance);
				}

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

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-text-field-helper-text': true,
				'mdc-text-field-helper-text--persistent': persistent,
				'mdc-text-field-helper-text--validation-msg': validationMsg,
				...internalClasses,
				[className]: true
			})),
			'aria-hidden': persistent ? undefined : 'true',
			id,
			...internalAttrs,
			...restProps
		})}>`);

		if (content == null) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(content)}`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { getElement });
	});
}