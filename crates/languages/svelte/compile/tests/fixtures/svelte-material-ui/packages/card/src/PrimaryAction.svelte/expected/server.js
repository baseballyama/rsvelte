import * as $ from 'svelte/internal/server';
import { classMap, useActions } from '@smui/common/internal';
import Ripple from '@smui/ripple';

export default function PrimaryAction($$renderer, $$props) {
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
		 * Whether to show a ripple animation.
		 */
		/**
		 * The color of the action.
		 */
		/**
		 * Whether to add padding.
		 */
		/**
		 * The tab index.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			ripple = true,
			color,
			padded = false,
			tabindex = 0,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let internalClasses = {};
		let internalStyles = {};

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

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-card__primary-action': true,
				'smui-card__primary-action--padded': padded,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			tabindex,
			role: 'button',
			...restProps
		})}><div class="mdc-card__ripple"></div> `);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { getElement });
	});
}