import * as $ from 'svelte/internal/server';
import { onMount, getContext, tick } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { deprecated } from './mdc';

export default function TrailingAction($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { MDCChipTrailingActionFoundation } = deprecated;

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
		 * Whether to show a ripple animation.
		 */
		/**
		 * Whether to use touch styling
		 */
		/**
		 * Whether to hide this element from the accessibility tree.
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
			ripple = true,
			touch = false,
			nonNavigable = false,
			icon$use = [],
			icon$class = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let internalStyles = {};
		let internalAttrs = {};
		const SMUIChipsTrailingActionMount = getContext('SMUI:chips:trailing-action:mount');
		const SMUIChipsTrailingActionUnmount = getContext('SMUI:chips:trailing-action:unmount');

		onMount(() => {
			instance = new MDCChipTrailingActionFoundation({
				focus: () => {
					const element = getElement();

					// Let the tabindex change propagate.
					waitForTabindex(() => {
						element.focus();
					});
				},
				getAttribute: getAttr,
				notifyInteraction: (trigger) => dispatch(getElement(), 'SMUIChipTrailingActionInteraction', { trigger }),
				notifyNavigation: (key) => dispatch(getElement(), 'SMUIChipTrailingActionNavigation', { key }),
				setAttribute: addAttr
			});

			const accessor = { isNavigable, focus, removeFocus };

			SMUIChipsTrailingActionMount && SMUIChipsTrailingActionMount(accessor);
			instance.init();

			return () => {
				SMUIChipsTrailingActionUnmount && SMUIChipsTrailingActionUnmount(accessor);
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

		function waitForTabindex(fn) {
			if (internalAttrs['tabindex'] !== getElement().getAttribute('tabindex')) {
				tick().then(fn);
			} else {
				fn();
			}
		}

		function isNavigable() {
			if (instance == null) {
				throw new Error('Instance is undefined.');
			}

			return instance.isNavigable();
		}

		function focus() {
			instance?.focus();
		}

		function removeFocus() {
			instance?.removeFocus();
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<button${$.attributes({
			type: 'button',
			class: $.clsx(classMap({
				'mdc-deprecated-chip-trailing-action': true,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			'aria-hidden': nonNavigable ? 'true' : undefined,
			tabindex: '-1',
			...internalAttrs,
			...exclude(restProps, ['icon$'])
		})}><span class="mdc-deprecated-chip-trailing-action__ripple"></span> `);

		if (touch) {
			$$renderer.push(`<!--[0--><span class="mdc-deprecated-chip-trailing-action__touch"></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span${$.attributes({
			class: $.clsx(classMap({
				'mdc-deprecated-chip-trailing-action__icon': true,
				[icon$class]: true
			})),
			...prefixFilter(restProps, 'icon$')
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span></button>`);
		$.bind_props($$props, { isNavigable, focus, removeFocus, getElement });
	});
}