import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { classMap } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';

export default function Fab($$renderer, $$props) {
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
		 * Whether to show a focus fing.
		 */
		/**
		 * The color of the button.
		 */
		/**
		 * Whether to shrink the button to mini size.
		 */
		/**
		 * Change this to true to animate out the button.
		 */
		/**
		 * Whether to use the extended style with a label.
		 */
		/**
		 * Whether to use touch styling
		 */
		/**
		 * If provided, the button will act as a link.
		 */
		/**
		 * The component to use to render the element.
		 */
		/**
		 * The tag name of the element to create.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			ripple = true,
			focusRing = false,
			color = 'secondary',
			mini = false,
			exited = false,
			extended = false,
			touch = false,
			href,
			component: MyComponent = SmuiElement,
			tag = href == null ? 'button' : 'a',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let internalClasses = {};
		let internalStyles = {};

		setContext('SMUI:label:context', 'fab');
		setContext('SMUI:icon:context', 'fab');

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
			return element.getElement();
		}

		if (MyComponent) {
			$$renderer.push('<!--[-->');

			MyComponent($$renderer, $.spread_props([
				{
					tag,
					use: [
						[
							Ripple,
							{
								ripple,
								unbounded: false,
								color,
								disabled: !!restProps.disabled,
								addClass,
								removeClass,
								addStyle
							}
						],
						...use
					],

					class: classMap({
						'mdc-fab': true,
						'mdc-fab--mini': mini,
						'mdc-fab--exited': exited,
						'mdc-fab--extended': extended,
						'smui-fab--color-primary': color === 'primary',
						'mdc-fab--touch': touch,
						...internalClasses,
						[className]: true
					}),
					style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
					href
				},
				restProps,
				{
					children: ($$renderer) => {
						$$renderer.push(`<div class="mdc-fab__ripple"></div> `);

						if (focusRing) {
							$$renderer.push(`<!--[0--><div class="mdc-fab__focus-ring"></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						children?.($$renderer);
						$$renderer.push(`<!---->`);

						if (touch) {
							$$renderer.push(`<!--[0--><div class="mdc-fab__touch"></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { getElement });
	});
}