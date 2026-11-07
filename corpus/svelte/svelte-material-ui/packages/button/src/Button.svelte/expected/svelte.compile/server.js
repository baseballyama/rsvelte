import * as $ from 'svelte/internal/server';
import { setContext, getContext } from 'svelte';
import { classMap, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';

export default function Button($$renderer, $$props) {
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
		 * The color of the button.
		 */
		/**
		 * The styling variant of the button.
		 */
		/**
		 * Whether to use touch styling
		 */
		/**
		 * If provided, the button will act as a link.
		 */
		/**
		 * The action the button represents.
		 */
		/**
		 * Whether the button is the default action for the dialog.
		 */
		/**
		 * Whether the button is the secondary button for the banner.
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
			color = 'primary',
			variant = 'text',
			touch = false,
			href,
			action = 'close',
			defaultAction = false,
			secondary = false,
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
		let context = getContext('SMUI:button:context');
		const actionProp = $.derived(() => context === 'dialog:action' && action != null ? { 'data-mdc-dialog-action': action } : { action });
		const defaultProp = $.derived(() => context === 'dialog:action' && defaultAction ? { 'data-mdc-dialog-button-default': '' } : {});
		const secondaryProp = $.derived(() => context === 'banner' ? {} : { secondary });
		let previousDisabled = restProps.disabled;

		setContext('SMUI:label:context', 'button');
		setContext('SMUI:icon:context', 'button');

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

		function handleClick() {
			if (context === 'banner') {
				dispatch(getElement(), secondary
					? 'SMUIBannerButtonSecondaryActionClick'
					: 'SMUIBannerButtonPrimaryActionClick');
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
						'mdc-button': true,
						'mdc-button--raised': variant === 'raised',
						'mdc-button--unelevated': variant === 'unelevated',
						'mdc-button--outlined': variant === 'outlined',
						'smui-button--color-secondary': color === 'secondary',
						'mdc-button--touch': touch,
						'mdc-card__action': context === 'card:action',
						'mdc-card__action--button': context === 'card:action',
						'mdc-dialog__button': context === 'dialog:action',
						'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',
						'mdc-top-app-bar__action-item': context === 'top-app-bar:action',
						'mdc-snackbar__action': context === 'snackbar:actions',
						'mdc-banner__secondary-action': context === 'banner' && secondary,
						'mdc-banner__primary-action': context === 'banner' && !secondary,
						'mdc-tooltip--rich-action': context === 'tooltip:rich-actions',
						...internalClasses,
						[className]: true
					}),
					style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' ')
				},
				actionProp(),
				defaultProp(),
				secondaryProp(),
				{ href },
				restProps,
				{
					onclick: (e) => {
						handleClick();
						restProps.onclick?.(e);
					},

					children: ($$renderer) => {
						$$renderer.push(`<div class="mdc-button__ripple"></div> `);
						children?.($$renderer);
						$$renderer.push(`<!---->`);

						if (touch) {
							$$renderer.push(`<!--[0--><div class="mdc-button__touch"></div>`);
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