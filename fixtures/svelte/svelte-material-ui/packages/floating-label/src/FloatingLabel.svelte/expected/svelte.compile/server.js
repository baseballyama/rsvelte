import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, useActions, SvelteEventManager } from '@smui/common/internal';
import { MDCFloatingLabelFoundation } from './mdc';

export default function FloatingLabel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		 * The ID that this label is for.
		 */
		/**
		 * Whether to float the label.
		 */
		/**
		 * Whether to style for a required input.
		 */
		/**
		 * Whether the input is already wrapped in a label.
		 *
		 * If not, a label element will be used with the ID value in the `for` prop.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			for: forId,
			floatAbove = false,
			required = false,
			wrapped = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let internalClasses = {};
		let internalStyles = {};
		let inputProps = getContext('SMUI:generic:input:props') ?? {};
		let previousFloatAbove = floatAbove;
		let previousRequired = required;
		const SMUIFloatingLabelMount = getContext('SMUI:floating-label:mount');
		const SMUIFloatingLabelUnmount = getContext('SMUI:floating-label:unmount');

		onMount(() => {
			instance = new MDCFloatingLabelFoundation({
				addClass,
				removeClass,
				hasClass,
				getWidth: () => {
					const el = getElement();
					const clone = el.cloneNode(true);

					el.parentNode?.appendChild(clone);
					clone.classList.add('smui-floating-label--remove-transition');
					clone.classList.add('smui-floating-label--force-size');
					clone.classList.remove('mdc-floating-label--float-above');

					const scrollWidth = clone.scrollWidth;

					el.parentNode?.removeChild(clone);

					return scrollWidth;
				},
				registerInteractionHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterInteractionHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler)
			});

			const accessor = {
				get element() {
					return getElement();
				},
				addStyle,
				removeStyle
			};

			SMUIFloatingLabelMount && SMUIFloatingLabelMount(accessor);
			instance.init();

			return () => {
				SMUIFloatingLabelUnmount && SMUIFloatingLabelUnmount(accessor);
				instance?.destroy();
				instance = undefined;
				eventManager.clear();
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

		function addStyle(name, value) {
			if (internalStyles[name] != value) {
				if (value === '' || value == null) {
					delete internalStyles[name];
				} else {
					internalStyles[name] = value;
				}
			}
		}

		function removeStyle(name) {
			if (name in internalStyles) {
				delete internalStyles[name];
			}
		}

		function shake(shouldShake) {
			instance?.shake(shouldShake);
		}

		function float(shouldFloat) {
			floatAbove = shouldFloat;
		}

		function setRequired(isRequired) {
			required = isRequired;
		}

		function getWidth() {
			if (instance == null) {
				throw new Error('Instance is undefined.');
			}

			return instance.getWidth();
		}

		function getElement() {
			return element;
		}

		if (wrapped) {
			$$renderer.push(`<!--[0--><span${$.attributes({
				class: $.clsx(classMap({
					'mdc-floating-label': true,
					'mdc-floating-label--float-above': floatAbove,
					'mdc-floating-label--required': required,
					...internalClasses,
					[className]: true
				})),
				style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push(`<!--[-1--><label${$.attributes({
				class: $.clsx(classMap({
					'mdc-floating-label': true,
					'mdc-floating-label--float-above': floatAbove,
					'mdc-floating-label--required': required,
					...internalClasses,
					[className]: true
				})),
				style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
				for: forId || (inputProps ? inputProps.id : undefined),
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></label>`);
		}

		$$renderer.push(`<!--]-->`);

		$.bind_props($$props, {
			floatAbove,
			required,
			shake,
			float,
			setRequired,
			getWidth,
			getElement
		});
	});
}