import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { classMap, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

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
		 * A spot for the description.
		 */
		/**
		 * A spot for the icon.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			ripple = true,
			children,
			description,
			icon,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let internalClasses = {};
		let internalStyles = {};
		const disabled = getContext('SMUI:accordion:panel:disabled');
		const nonInteractive = getContext('SMUI:accordion:panel:nonInteractive');
		const open = getContext('SMUI:accordion:panel:open');

		function handleClick(event) {
			if (event.button === 0) {
				dispatch(getElement(), 'SMUIAccordionHeaderActivate', { event });
			}
		}

		function handleKeyDown(event) {
			if (event.key === 'Enter') {
				dispatch(getElement(), 'SMUIAccordionHeaderActivate', { event });
			}
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

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'smui-accordion__header': true,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			role: 'button',
			tabindex: $.store_get($$store_subs ??= {}, '$nonInteractive', nonInteractive) ? -1 : 0,
			'aria-expanded': $.store_get($$store_subs ??= {}, '$open', open) ? 'true' : 'false',
			...restProps
		})}>`);

		if (ripple) {
			$$renderer.push(`<!--[0--><div class="smui-accordion__header__ripple"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(classMap({
			'smui-accordion__header__title': true,
			'smui-accordion__header__title--with-description': description
		})))}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div> `);

		if (description) {
			$$renderer.push(`<!--[0--><div class="smui-accordion__header__description">`);
			description?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (icon) {
			$$renderer.push(`<!--[0--><div class="smui-accordion__header__icon">`);
			icon?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}