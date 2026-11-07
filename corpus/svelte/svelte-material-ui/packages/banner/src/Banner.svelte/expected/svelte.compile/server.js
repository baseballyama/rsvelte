import * as $ from 'svelte/internal/server';
import { onMount, onDestroy, getContext, setContext, tick } from 'svelte';
import { focusTrap as domFocusTrap } from '@smui/common/dom';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import { CloseReason, MDCBannerFoundation } from './mdc';
import Fixed from './Fixed.svelte';

export default function Banner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { FocusTrap } = domFocusTrap;

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
		 * Whether the banner is open.
		 */
		/**
		 * Whether the banner closes on button click.
		 */
		/**
		 * Whether the banner contents are centered.
		 */
		/**
		 * Fix the banner to the top of the container.
		 */
		/**
		 * Stack the buttons under the content on mobile displays.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			open = false,
			autoClose = true,
			centered = false,
			fixed = false,
			mobileStacked = false,
			content$class = '',
			textWrapper$class = '',
			graphic$class = '',
			children,
			icon,
			label,
			actions,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let internalStyles = {};
		let content;
		let focusTrap;
		let addLayoutListener = getContext('SMUI:addLayoutListener');
		let removeLayoutListener;
		let width = void 0;

		// This is for a div that uses the role of "img". TS doesn't like it directly
		// on the element.
		const altProp = { alt: '' };

		setContext('SMUI:label:context', 'banner');
		setContext('SMUI:icon:context', 'banner');
		setContext('SMUI:button:context', 'banner');

		let previousMobileStacked = mobileStacked;

		if (addLayoutListener) {
			removeLayoutListener = addLayoutListener(layout);
		}

		onMount(() => {
			let initialFocusEl = getPrimaryActionEl();

			if (initialFocusEl) {
				focusTrap = new FocusTrap(element, { initialFocusEl });
			}

			instance = new MDCBannerFoundation({
				addClass,
				getContentHeight: () => {
					let offsetHeight = content.offsetHeight;

					if (offsetHeight === 0) {
						getElement().classList.add('smui-banner--force-show');

						if (width) {
							content.style.setProperty('width', `${width}px`);
						}

						offsetHeight = content.offsetHeight;
						getElement().classList.remove('smui-banner--force-show');

						if (width) {
							content.style.removeProperty('width');
						}
					}

					return offsetHeight;
				},

				notifyClosed: (reason) => {
					open = false;
					dispatch(getElement(), 'SMUIBannerClosed', { reason });
				},
				notifyClosing: (reason) => dispatch(getElement(), 'SMUIBannerClosing', { reason }),
				notifyOpened: () => {
					open = true;
					dispatch(getElement(), 'SMUIBannerOpened', {});
				},
				notifyOpening: () => dispatch(getElement(), 'SMUIBannerOpening', {}),
				notifyActionClicked: (action) => dispatch(getElement(), 'SMUIBannerActionClicked', { action }),
				releaseFocus: () => focusTrap && focusTrap.releaseFocus(),
				removeClass,
				setStyleProperty: addStyle,
				trapFocus: () => focusTrap && focusTrap.trapFocus()
			});

			instance.init();
			layout();

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

		onDestroy(() => {
			if (removeLayoutListener) {
				removeLayoutListener();
			}
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

		function getPrimaryActionEl() {
			return getElement().querySelector('.mdc-banner__primary-action') ?? undefined;
		}

		function handlePrimaryActionClick() {
			instance?.handlePrimaryActionClick(!autoClose);
		}

		function handleSecondaryActionClick() {
			instance?.handleSecondaryActionClick(!autoClose);
		}

		function isOpen() {
			return open;
		}

		function setOpen(value) {
			open = value;
		}

		function layout() {
			if (fixed) {
				width = getElement().offsetWidth;

				if (width === 0) {
					getElement().classList.add('smui-banner--force-show');
					width = getElement().offsetWidth;
					getElement().classList.remove('smui-banner--force-show');
				}
			}

			if (instance) {
				instance.layout();
			}
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-banner': true,
				'mdc-banner--centered': centered,
				'mdc-banner--mobile-stacked': mobileStacked,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			role: 'banner',
			...exclude(restProps, ['content$', 'textWrapper$', 'graphic$'])
		})}>`);

		Fixed($$renderer, {
			fixed,
			width,
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attributes({
					class: $.clsx(classMap({ 'mdc-banner__content': true, [content$class]: true })),
					role: 'alertdialog',
					'aria-live': 'assertive',
					...prefixFilter(restProps, 'content$')
				})}>`);

				if (icon || label) {
					$$renderer.push(`<!--[0--><div${$.attributes({
						class: $.clsx(classMap({
							'mdc-banner__graphic-text-wrapper': true,
							[textWrapper$class]: true
						})),
						...prefixFilter(restProps, 'textWrapper$')
					})}>`);

					if (icon) {
						$$renderer.push(`<!--[0--><div${$.attributes({
							class: $.clsx(classMap({ 'mdc-banner__graphic': true, [graphic$class]: true })),
							role: 'img',
							...altProp,
							...prefixFilter(restProps, 'graphic$')
						})}>`);

						icon?.($$renderer);
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);
					label?.($$renderer);
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (actions) {
					$$renderer.push(`<!--[0--><div class="mdc-banner__actions">`);
					actions?.($$renderer);
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { open, isOpen, setOpen, layout, getElement });
	});
}