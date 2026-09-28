import * as $ from 'svelte/internal/server';
import { onMount, setContext, getContext } from 'svelte';
import { classMap, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';

let counter = 0;

export default function Item($$renderer, $$props) {
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
		 * The color of the item.
		 */
		/**
		 * Whether the item should ignore all user input.
		 */
		/**
		 * Whether to show a ripple animation.
		 */
		/**
		 * Whether this item wraps another list.
		 */
		/**
		 * Whether this item is activated.
		 */
		/**
		 * The accessibility role of this item.
		 */
		/**
		 * Whether this item is selected.
		 */
		/**
		 * Whether this item is disabled.
		 */
		/**
		 * If this is a menu item, skip restoring focus to the previous item when
		 * this is selected.
		 */
		/**
		 * The item's tab index.
		 */
		/**
		 * An ID to pass down to an input.
		 */
		/**
		 * If provided, the item will act as a link.
		 */
		/**
		 * The component to use to render the element.
		 */
		/**
		 * The tag name of the element to create.
		 */
		let nav = getContext('SMUI:list:item:nav');

		let {
			use = [],
			class: className = '',
			style = '',
			color,
			nonInteractive = getContext('SMUI:list:nonInteractive') ?? false,
			ripple = !nonInteractive,
			wrapper = false,
			activated = false,
			role = wrapper ? 'presentation' : getContext('SMUI:list:item:role'),
			selected = false,
			disabled = false,
			skipRestoreFocus = false,
			tabindex: tabindexProp = uninitializedValue,
			inputId = 'SMUI-form-field-list-' + counter++,
			href,
			component: MyComponent = SmuiElement,
			tag = nav ? href ? 'a' : 'span' : 'li',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		setContext('SMUI:list:nonInteractive', undefined);
		setContext('SMUI:list:item:role', undefined);

		let element;
		let internalClasses = {};
		let internalStyles = {};
		let internalAttrs = {};
		let input = void 0;
		let addTabindexIfNoItemsSelectedRaf = void 0;

		const tabindex = $.derived(() => isUninitializedValue(tabindexProp)
			? !nonInteractive && !disabled && (selected || input && input.checked) ? 0 : -1
			: tabindexProp);

		setContext('SMUI:generic:input:props', { id: inputId });

		// Reset separator context, because we aren't directly under a list anymore.
		setContext('SMUI:separator:context', undefined);

		setContext('SMUI:generic:input:mount', (accessor) => {
			if ('_smui_checkbox_accessor' in accessor || '_smui_radio_accessor' in accessor) {
				input = accessor;
			}
		});

		setContext('SMUI:generic:input:unmount', () => {
			input = undefined;
		});

		const SMUIListItemMount = getContext('SMUI:list:item:mount');
		const SMUIListItemUnmount = getContext('SMUI:list:item:unmount');

		onMount(() => {
			// Tabindex needs to be '0' if this is the first non-disabled list item, and
			// no other item is selected.
			if (!selected && !nonInteractive && element) {
				let first = true;
				let el = element.getElement();

				while (el.previousElementSibling) {
					el = el.previousElementSibling;

					if (el.nodeType === 1 && el.classList.contains('mdc-deprecated-list-item') && !el.classList.contains('mdc-deprecated-list-item--disabled')) {
						first = false;

						break;
					}
				}

				if (first) {
					// This is first, so now set up a check that no other items are
					// selected.
					addTabindexIfNoItemsSelectedRaf = window.requestAnimationFrame(() => addTabindexIfNoItemsSelected(el));
				}
			}

			const accessor = {
				_smui_list_item_accessor: true,
				get element() {
					return getElement();
				},

				get selected() {
					return selected;
				},

				set selected(value) {
					selected = value;
				},
				hasClass,
				addClass,
				removeClass,
				getAttr,
				addAttr,
				removeAttr,
				getPrimaryText,
				// For inputs within item.
				get checked() {
					return (input && input.checked) ?? false;
				},

				set checked(value) {
					if (input) {
						input.checked = !!value;
					}
				},

				get hasCheckbox() {
					return !!(input && '_smui_checkbox_accessor' in input);
				},

				get hasRadio() {
					return !!(input && '_smui_radio_accessor' in input);
				},

				activateRipple() {
					if (input) {
						input.activateRipple();
					}
				},

				deactivateRipple() {
					if (input) {
						input.deactivateRipple();
					}
				},

				// For select options.
				getValue() {
					return restProps.value;
				},

				// For autocomplete
				action,

				get tabindex() {
					return tabindex();
				},

				set tabindex(value) {
					tabindexProp = value;
				},

				get disabled() {
					return disabled;
				},

				get activated() {
					return activated;
				},

				set activated(value) {
					activated = value;
				}
			};

			SMUIListItemMount && SMUIListItemMount(accessor);

			return () => {
				SMUIListItemUnmount && SMUIListItemUnmount(accessor);

				if (addTabindexIfNoItemsSelectedRaf) {
					window.cancelAnimationFrame(addTabindexIfNoItemsSelectedRaf);
				}
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

		function removeAttr(name) {
			if (!(name in internalAttrs) || internalAttrs[name] != null) {
				internalAttrs[name] = undefined;
			}
		}

		function addTabindexIfNoItemsSelected(el) {
			// Look through next siblings to see if none of them are selected.
			let noneSelected = true;

			while (el.nextElementSibling) {
				el = el.nextElementSibling;

				if (el.nodeType === 1 && el.classList.contains('mdc-deprecated-list-item')) {
					const tabindexAttr = el.attributes.getNamedItem('tabindex');

					if (tabindexAttr && tabindexAttr.value === '0') {
						noneSelected = false;

						break;
					}
				}
			}

			if (noneSelected) {
				// This is the first element, and no other element is selected, so the
				// tabindex should be '0'.
				tabindexProp = 0;
			}
		}

		function handleKeydown(e) {
			const isEnter = e.key === 'Enter';
			const isSpace = e.key === 'Space';

			if (isEnter || isSpace) {
				action(e);
			}
		}

		function action(e) {
			if (!disabled) {
				dispatch(getElement(), 'SMUIAction', e);
			}
		}

		function getPrimaryText() {
			if (!element) {
				return '';
			}

			const el = element.getElement();

			if (!el) {
				return '';
			}

			const primaryText = el.querySelector('.mdc-deprecated-list-item__primary-text');

			if (primaryText) {
				return primaryText.textContent ?? '';
			}

			const text = el.querySelector('.mdc-deprecated-list-item__text');

			if (text) {
				return text.textContent ?? '';
			}

			return el.textContent ?? '';
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
						...nonInteractive
							? []
							: [
								[
									Ripple,
									{
										ripple: !input,
										unbounded: false,
										color: (activated || selected) && color == null ? 'primary' : color,
										disabled,
										addClass,
										removeClass,
										addStyle
									}
								]
							],
						...use
					],

					class: classMap({
						'mdc-deprecated-list-item': !wrapper,
						'mdc-deprecated-list-item__wrapper': wrapper,
						'mdc-deprecated-list-item--activated': activated,
						'mdc-deprecated-list-item--selected': selected,
						'mdc-deprecated-list-item--disabled': disabled,
						'mdc-menu-item--selected': !nav && role === 'menuitem' && selected,
						'smui-menu-item--non-interactive': nonInteractive,
						...internalClasses,
						[className]: true
					}),
					style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' ')
				},
				nav && activated ? { 'aria-current': 'page' } : {},
				!nav || wrapper ? { role } : {},
				!nav && role === 'option' ? { 'aria-selected': selected ? 'true' : 'false' } : {},
				!nav && (role === 'radio' || role === 'checkbox')
					? { 'aria-checked': input && input.checked ? 'true' : 'false' }
					: {},
				!nav ? { 'aria-disabled': disabled ? 'true' : 'false' } : {},
				{
					'data-menu-item-skip-restore-focus': skipRestoreFocus || undefined,
					tabindex: tabindex(),
					href
				},
				internalAttrs,
				restProps,
				{
					onclick: (e) => {
						action(e);
						restProps.onclick?.(e);
					},

					onkeydown: (e) => {
						handleKeydown(e);
						restProps.onkeydown?.(e);
					},

					children: ($$renderer) => {
						if (ripple) {
							$$renderer.push(`<!--[0--><span class="mdc-deprecated-list-item__ripple"></span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, {
			activated,
			selected,
			tabindex: tabindexProp,
			action,
			getPrimaryText,
			getElement
		});
	});
}