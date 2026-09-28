import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCSelectHelperTextFoundation } from './mdc';

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
			id = 'SMUI-select-helper-text-' + counter++,
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
		const SMUISelectHelperTextId = getContext('SMUI:select:helper-text:id');
		const SMUISelectHelperTextMount = getContext('SMUI:select:helper-text:mount');
		const SMUISelectHelperTextUnmount = getContext('SMUI:select:helper-text:unmount');

		onMount(() => {
			instance = new MDCSelectHelperTextFoundation({
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

			SMUISelectHelperTextId && SMUISelectHelperTextId(id);
			SMUISelectHelperTextMount && SMUISelectHelperTextMount(instance);
			instance.init();

			return () => {
				if (SMUISelectHelperTextUnmount && instance) {
					SMUISelectHelperTextUnmount(instance);
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
				'mdc-select-helper-text': true,
				'mdc-select-helper-text--validation-msg': validationMsg,
				'mdc-select-helper-text--validation-msg-persistent': persistent,
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