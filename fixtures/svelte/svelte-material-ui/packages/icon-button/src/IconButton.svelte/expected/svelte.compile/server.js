import * as $ from 'svelte/internal/server';
import { onMount, getContext, setContext } from 'svelte';
import { classMap, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';
import { MDCIconButtonToggleFoundation } from './mdc';

export default function IconButton($$renderer, $$props) {
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
		 * Whether to show a ripple animation.
		 */
		/**
		 * The color of the button.
		 */
		/**
		 * Whether to act as a toggle button.
		 */
		/**
		 * When acting as a toggle button, whether the button is toggled.
		 */
		/**
		 * The ARIA label for the pressed state.
		 */
		/**
		 * The ARIA label for the unpressed stated.
		 */
		/**
		 * Whether to use touch styling
		 */
		/**
		 * Use flex styling.
		 */
		/**
		 * The size of the button.
		 */
		/**
		 * If provided, the button will act as a link.
		 */
		/**
		 * The action the button represents.
		 */
		/**
		 * If false, hides the high contrast mode focus ring element.
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
			color,
			toggle = false,
			pressed = uninitializedValue,
			ariaLabelOn,
			ariaLabelOff,
			touch = false,
			displayFlex = true,
			size = 'normal',
			href,
			action,
			focusRing = true,
			component: MyComponent = SmuiElement,
			tag = href == null ? 'button' : 'a',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance;
		let internalClasses = {};
		let internalStyles = {};
		let internalAttrs = {};
		let context = getContext('SMUI:icon-button:context');
		let ariaDescribedby = getContext('SMUI:icon-button:aria-describedby');

		const actionProp = $.derived(() => {
			if (context === 'data-table:pagination') {
				switch (action) {
					case 'first-page':
						return { 'data-first-page': 'true' };

					case 'prev-page':
						return { 'data-prev-page': 'true' };

					case 'next-page':
						return { 'data-next-page': 'true' };

					case 'last-page':
						return { 'data-last-page': 'true' };

					default:
						return { 'data-action': 'true' };
				}
			} else if (context === 'dialog:header' || context === 'dialog:sheet') {
				return { 'data-mdc-dialog-action': action };
			} else {
				return { action };
			}
		});

		let previousDisabled = !!restProps.disabled;

		setContext('SMUI:icon:context', 'icon-button');

		let oldToggle = null;

		onMount(() => {
			return () => {
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

		function handleChange(evtData) {
			pressed = evtData.isOn;
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
								unbounded: true,
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
						'mdc-icon-button': true,
						'mdc-icon-button--on': !isUninitializedValue(pressed) && pressed,
						'mdc-icon-button--touch': touch,
						'mdc-icon-button--display-flex': displayFlex,
						'smui-icon-button--size-button': size === 'button',
						'smui-icon-button--size-mini': size === 'mini',
						'mdc-icon-button--reduced-size': size === 'mini' || size === 'button',
						'mdc-card__action': context === 'card:action',
						'mdc-card__action--icon': context === 'card:action',
						'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',
						'mdc-top-app-bar__action-item': context === 'top-app-bar:action',
						'mdc-snackbar__dismiss': context === 'snackbar:actions',
						'mdc-data-table__pagination-button': context === 'data-table:pagination',
						'mdc-data-table__sort-icon-button': context === 'data-table:sortable-header-cell',
						'mdc-dialog__close': (context === 'dialog:header' || context === 'dialog:sheet') && action === 'close',
						...internalClasses,
						[className]: true
					}),
					style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
					'aria-pressed': !isUninitializedValue(pressed) ? pressed ? 'true' : 'false' : null,
					'aria-label': pressed ? ariaLabelOn : ariaLabelOff,
					'data-aria-label-on': ariaLabelOn,
					'data-aria-label-off': ariaLabelOff,
					'aria-describedby': ariaDescribedby,
					href
				},
				actionProp(),
				internalAttrs,
				restProps,
				{
					onclick: (e) => {
						if (instance) {
							instance.handleClick();
						}

						if (context === 'top-app-bar:navigation') {
							dispatch(getElement(), 'SMUITopAppBarIconButtonNav');
						}

						restProps.onclick?.(e);
					},

					children: ($$renderer) => {
						$$renderer.push(`<div class="mdc-icon-button__ripple"></div> `);

						if (focusRing) {
							$$renderer.push(`<!--[0--><span class="mdc-icon-button__focus-ring"></span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						children?.($$renderer);
						$$renderer.push(`<!---->`);

						if (touch) {
							$$renderer.push(`<!--[0--><div class="mdc-icon-button__touch"></div>`);
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

		$.bind_props($$props, { pressed, getElement });
	});
}