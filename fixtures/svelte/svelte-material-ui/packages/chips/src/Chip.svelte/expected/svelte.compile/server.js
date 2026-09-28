import * as $ from 'svelte/internal/server';
import { onMount, setContext, getContext } from 'svelte';
import { writable } from 'svelte/store';
import { classMap, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';
import { deprecated } from './mdc';

export default function Chip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { MDCChipFoundation } = deprecated;

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
		 * The chip object this chip is for.
		 */
		/**
		 * Whether to show a ripple animation.
		 */
		/**
		 * Whether to use touch styling
		 */
		/**
		 * Whether this chip should be removed when user clicks the trailing icon.
		 */
		/**
		 * Whether primary action should focus when user clicks the chip.
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
			chip: chipId,
			ripple = true,
			touch = false,
			shouldRemoveOnTrailingIconClick = true,
			shouldFocusPrimaryActionOnClick = true,
			component: MyComponent = SmuiElement,
			tag = 'div',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let leadingIconClasses = {};
		let internalStyles = {};
		const initialSelectedStore = getContext('SMUI:chips:chip:initialSelected');
		let selected = $.store_get($$store_subs ??= {}, '$initialSelectedStore', initialSelectedStore);
		let primaryActionAccessor = undefined;
		let trailingActionAccessor = undefined;
		const nonInteractive = getContext('SMUI:chips:nonInteractive');
		const choice = getContext('SMUI:chips:choice');
		const index = getContext('SMUI:chips:chip:index');
		const shouldRemoveOnTrailingIconClickStore = writable(shouldRemoveOnTrailingIconClick);

		setContext('SMUI:chips:chip:shouldRemoveOnTrailingIconClick', shouldRemoveOnTrailingIconClickStore);

		const isSelectedStore = writable(selected);

		setContext('SMUI:chips:chip:isSelected', isSelectedStore);

		const leadingIconClassesStore = writable(leadingIconClasses);

		setContext('SMUI:chips:chip:leadingIconClasses', leadingIconClassesStore);
		setContext('SMUI:chips:chip:focusable', $.store_get($$store_subs ??= {}, '$choice', choice) && selected || $.store_get($$store_subs ??= {}, '$index', index) === 0);

		setContext('SMUI:chips:primary-action:mount', (accessor) => {
			primaryActionAccessor = accessor;
		});

		setContext('SMUI:chips:primary-action:unmount', () => {
			primaryActionAccessor = undefined;
		});

		setContext('SMUI:chips:trailing-action:mount', (accessor) => {
			trailingActionAccessor = accessor;
		});

		setContext('SMUI:chips:trailing-action:unmount', () => {
			trailingActionAccessor = undefined;
		});

		const SMUIChipsChipMount = getContext('SMUI:chips:chip:mount');
		const SMUIChipsChipUnmount = getContext('SMUI:chips:chip:unmount');

		onMount(() => {
			instance = new MDCChipFoundation({
				addClass,
				addClassToLeadingIcon: addLeadingIconClass,
				eventTargetHasClass: (target, className) => target && 'classList' in target ? target.classList.contains(className) : false,
				focusPrimaryAction: () => {
					if (primaryActionAccessor) {
						primaryActionAccessor.focus();
					}
				},

				focusTrailingAction: () => {
					if (trailingActionAccessor) {
						trailingActionAccessor.focus();
					}
				},
				getAttribute: (attr) => getElement().getAttribute(attr),
				getCheckmarkBoundingClientRect: () => {
					const target = getElement().querySelector('.mdc-chip__checkmark');

					if (target) {
						return target.getBoundingClientRect();
					}

					return null;
				},
				getComputedStyleValue: getStyle,
				getRootBoundingClientRect: () => getElement().getBoundingClientRect(),
				hasClass,
				hasLeadingIcon: () => {
					const target = getElement().querySelector('.mdc-chip__icon--leading');

					return !!target;
				},
				isRTL: () => getComputedStyle(getElement()).getPropertyValue('direction') === 'rtl',
				isTrailingActionNavigable: () => {
					if (trailingActionAccessor) {
						return trailingActionAccessor.isNavigable();
					}

					return false;
				},
				notifyInteraction: () => dispatch(getElement(), 'SMUIChipInteraction', { chipId }),
				notifyNavigation: (key, source) => dispatch(getElement(), 'SMUIChipNavigation', { chipId, key, source }),
				notifyRemoval: (removedAnnouncement) => dispatch(getElement(), 'SMUIChipRemoval', { chipId, removedAnnouncement }),
				notifySelection: (selected, shouldIgnore) => dispatch(getElement(), 'SMUIChipSelection', { chipId, selected, shouldIgnore }),
				notifyTrailingIconInteraction: () => dispatch(getElement(), 'SMUIChipTrailingIconInteraction', { chipId }),
				notifyEditStart: () => {
					/* Not Implemented. */
				},

				notifyEditFinish: () => {
					/* Not Implemented. */
				},
				removeClass,
				removeClassFromLeadingIcon: removeLeadingIconClass,
				removeTrailingActionFocus: () => {
					if (trailingActionAccessor) {
						trailingActionAccessor.removeFocus();
					}
				},

				setPrimaryActionAttr: (attr, value) => {
					if (primaryActionAccessor) {
						primaryActionAccessor.addAttr(attr, value);
					}
				},
				setStyleProperty: addStyle
			});

			const accessor = {
				chipId,
				get selected() {
					return selected;
				},
				focusPrimaryAction,
				focusTrailingAction,
				removeFocus,
				setSelectedFromChipSet
			};

			SMUIChipsChipMount && SMUIChipsChipMount(accessor);
			instance.init();

			return () => {
				SMUIChipsChipUnmount && SMUIChipsChipUnmount(accessor);
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

		function addLeadingIconClass(className) {
			if (!leadingIconClasses[className]) {
				leadingIconClasses[className] = true;
			}
		}

		function removeLeadingIconClass(className) {
			if (!(className in leadingIconClasses) || leadingIconClasses[className]) {
				leadingIconClasses[className] = false;
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

		function getStyle(name) {
			return name in internalStyles
				? internalStyles[name]
				: getComputedStyle(getElement()).getPropertyValue(name);
		}

		function setSelectedFromChipSet(value, shouldNotifyClients) {
			selected = value;
			instance?.setSelectedFromChipSet(selected, shouldNotifyClients);
		}

		function focusPrimaryAction() {
			instance?.focusPrimaryAction();
		}

		function focusTrailingAction() {
			instance?.focusTrailingAction();
		}

		function removeFocus() {
			instance?.removeFocus();
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
								ripple: ripple && !$.store_get($$store_subs ??= {}, '$nonInteractive', nonInteractive),
								unbounded: false,
								addClass,
								removeClass,
								addStyle
							}
						],
						...use
					],

					class: classMap({
						'mdc-chip': true,
						'mdc-chip--selected': selected,
						'mdc-chip--touch': touch,
						...internalClasses,
						[className]: true
					}),
					style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
					role: 'row'
				},
				restProps,
				{
					ontransitionend: (e) => {
						if (instance) {
							instance.handleTransitionEnd(e);
						}

						restProps.ontransitionend?.(e);
					},

					onclick: (e) => {
						if (instance) {
							instance.handleClick();
						}

						restProps.onclick?.(e);
					},

					onkeydown: (e) => {
						if (instance) {
							instance.handleKeydown(e);
						}

						restProps.onkeydown?.(e);
					},

					onfocusin: (e) => {
						if (instance) {
							instance.handleFocusIn(e);
						}

						restProps.onfocusin?.(e);
					},

					onfocusout: (e) => {
						if (instance) {
							instance.handleFocusOut(e);
						}

						restProps.onfocusout?.(e);
					},

					onSMUIChipTrailingActionInteraction: (e) => {
						if (instance) {
							instance.handleTrailingActionInteraction();
						}

						restProps.onSMUIChipTrailingActionInteraction?.(e);
					},

					onSMUIChipTrailingActionNavigation: (e) => {
						if (instance) {
							instance.handleTrailingActionNavigation(e);
						}

						restProps.onSMUIChipTrailingActionNavigation?.(e);
					},

					children: ($$renderer) => {
						if (ripple && !$.store_get($$store_subs ??= {}, '$nonInteractive', nonInteractive)) {
							$$renderer.push(`<!--[0--><div class="mdc-chip__ripple"></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						children?.($$renderer);
						$$renderer.push(`<!----> `);

						if (touch) {
							$$renderer.push(`<!--[0--><div class="mdc-chip__touch"></div>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}