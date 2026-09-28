import * as $ from 'svelte/internal/server';
import { onMount, setContext, getContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';
import TabIndicator from '@smui/tab-indicator';
import { MDCTabFoundation } from './mdc';

export default function Tab($$renderer, $$props) {
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
		 * The tab object this tab is for.
		 */
		/**
		 * Whether to show a ripple animation.
		 */
		/**
		 * Whether to stack the contents of the tab.
		 */
		/**
		 * Whether to use minimum width possible.
		 */
		/**
		 * Whether the indicator spans only the content instead of the whole tab.
		 */
		/**
		 * If provided, the tab will act as a link.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The component to use to render the element.
		 */
		/**
		 * The tag name of the element to create.
		 */
		/**
		 * A spot for the tab indicator content.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			tab: tabId,
			ripple = true,
			stacked = false,
			minWidth = false,
			indicatorSpanOnlyContent = false,
			href = undefined,
			content$use = [],
			content$class = '',
			component: MyComponent = SmuiElement,
			tag = href == null ? 'button' : 'a',
			children,
			tabIndicator,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let content;
		let tabIndicatorInstance;
		let internalClasses = {};
		let internalStyles = {};
		let internalAttrs = {};
		let focusOnActivate = getContext('SMUI:tab:focusOnActivate');
		const initialActive = getContext('SMUI:tab:initialActive');
		let active = initialActive.active != null && initialActive.key(tabId) === initialActive.active;
		let forceAccessible = false;

		setContext('SMUI:label:context', 'tab');
		setContext('SMUI:icon:context', 'tab');

		if (!tabId) {
			throw new Error('The tab property is required! It should be passed down from the TabBar to the Tab.');
		}

		let setFocusOnActivate = false;
		const SMUITabMount = getContext('SMUI:tab:mount');
		const SMUITabUnmount = getContext('SMUI:tab:unmount');

		onMount(() => {
			instance = new MDCTabFoundation({
				setAttr: addAttr,
				addClass,
				removeClass,
				hasClass,
				activateIndicator: (previousIndicatorClientRect) => tabIndicatorInstance.activate(previousIndicatorClientRect),
				deactivateIndicator: () => tabIndicatorInstance.deactivate(),
				notifyInteracted: () => dispatch(getElement(), 'SMUITabInteracted', { tabId }),
				getOffsetLeft: () => getElement().offsetLeft,
				getOffsetWidth: () => getElement().offsetWidth,
				getContentOffsetLeft: () => content.offsetLeft,
				getContentOffsetWidth: () => content.offsetWidth,
				focus,
				isFocused: () => getElement() === document.activeElement
			});

			const accessor = {
				tabId,
				get element() {
					return getElement();
				},

				get active() {
					return active;
				},

				forceAccessible(accessible) {
					forceAccessible = accessible;
				},
				computeIndicatorClientRect: () => tabIndicatorInstance.computeContentClientRect(),
				computeDimensions: () => {
					if (instance == null) {
						throw new Error('Instance is undefined.');
					}

					return instance.computeDimensions();
				},
				focus,
				activate,
				deactivate
			};

			SMUITabMount && SMUITabMount(accessor);
			instance.init();

			return () => {
				SMUITabUnmount && SMUITabUnmount(accessor);
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

		function addAttr(name, value) {
			if (internalAttrs[name] !== value) {
				internalAttrs[name] = value;
			}
		}

		function activate(previousIndicatorClientRect, skipFocus) {
			active = true;

			if (skipFocus) {
				instance?.setFocusOnActivate(false);
			}

			instance?.activate(previousIndicatorClientRect);

			if (skipFocus) {
				instance?.setFocusOnActivate(focusOnActivate);
			}
		}

		function deactivate() {
			active = false;
			instance?.deactivate();
		}

		function focus() {
			getElement().focus();
		}

		function getElement() {
			return element.getElement();
		}

		function tabIndicatorSnippet($$renderer) {
			TabIndicator($$renderer, $.spread_props([
				prefixFilter(restProps, 'tabIndicator$'),
				{
					get active() {
						return active;
					},

					set active($$value) {
						active = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						tabIndicator?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (MyComponent) {
				$$renderer.push('<!--[-->');

				MyComponent($$renderer, $.spread_props([
					{
						tag,
						use: [
							[
								Ripple,
								{ ripple, unbounded: false, addClass, removeClass, addStyle }
							],
							...use
						],

						class: classMap({
							'mdc-tab': true,
							'mdc-tab--active': active,
							'mdc-tab--stacked': stacked,
							'mdc-tab--min-width': minWidth,
							...internalClasses,
							[className]: true
						}),
						style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
						role: 'tab',
						'aria-selected': active ? 'true' : 'false',
						tabindex: active || forceAccessible ? '0' : '-1',
						href
					},
					internalAttrs,
					exclude(restProps, ['content$', 'tabIndicator$']),
					{
						onclick: (e) => {
							restProps.onclick?.(e);

							if (!e.defaultPrevented && instance) {
								instance.handleClick();
							}
						},

						children: ($$renderer) => {
							$$renderer.push(`<span${$.attributes({
								class: $.clsx(classMap({ 'mdc-tab__content': true, [content$class]: true })),
								...prefixFilter(restProps, 'content$')
							})}>`);

							children?.($$renderer);
							$$renderer.push(`<!----> `);

							if (indicatorSpanOnlyContent) {
								$$renderer.push('<!--[0-->');
								tabIndicatorSnippet($$renderer);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></span> `);

							if (!indicatorSpanOnlyContent) {
								$$renderer.push('<!--[0-->');
								tabIndicatorSnippet($$renderer);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <span class="mdc-tab__ripple"></span>`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { activate, deactivate, focus, getElement });
	});
}