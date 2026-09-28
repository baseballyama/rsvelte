import * as $ from 'svelte/internal/server';
import { onMount, onDestroy, getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { Anchor } from '@smui/menu-surface';
import Menu from '@smui/menu';
import List from '@smui/list';
import FloatingLabel from '@smui/floating-label';
import LineRipple from '@smui/line-ripple';
import NotchedOutline from '@smui/notched-outline';
import { MDCSelectFoundation } from './mdc';
import HelperText from './helper-text/HelperText.svelte';

let counter = 0;

export default function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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
		 * Whether the input is disabled.
		 */
		/**
		 * The styling variant of the input.
		 */
		/**
		 * Do not use a label.
		 */
		/**
		 * The label or a spot for the label.
		 */
		/**
		 * The value of the input.
		 */
		/**
		 * A function that turns values into string representations.
		 *
		 * This is necessary if your values can't be automatically turned into
		 * strings. So, for things like objects, functions, null, undefined, etc,
		 * this function should take a value and return a unique string
		 * representation.
		 *
		 * Whatever value semantically means "empty" or "none" can return an empty
		 * string to unfloat the label.
		 */
		/**
		 * Whether the input has been changed.
		 */
		/**
		 * Whether the input is invalid.
		 */
		/**
		 * Set to false to prevent updating the value passed to invalid.
		 *
		 * Defaults to true if and only if the invalid prop was not explicitly set.
		 */
		/**
		 * Whether the input is required.
		 */
		/**
		 * The ID the input will use.
		 */
		/**
		 * If true, a hidden HTML input element will be used.
		 *
		 * This is useful if the input is part of an HTML form.
		 */
		/**
		 * Whether a leading icon will be included after instantiation.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A spot for the leading icon.
		 */
		/**
		 * A spot for the helper text.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			ripple = true,
			disabled = false,
			variant = 'standard',
			noLabel = false,
			label = undefined,
			value = void 0,
			key = (item) => item,
			dirty = false,
			invalid = uninitializedValue,
			updateInvalid = isUninitializedValue(invalid),
			required = false,
			inputId = 'SMUI-select-' + counter++,
			hiddenInput = false,
			withLeadingIcon = uninitializedValue,
			anchor$use = [],
			anchor$class = '',
			selectedTextContainer$use = [],
			selectedTextContainer$class = '',
			selectedText$use = [],
			selectedText$class = '',
			dropdownIcon$use = [],
			dropdownIcon$class = '',
			menu$class = '',
			children,
			leadingIcon,
			helperText,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Some trickery to detect uninitialized values but also have the right types.
		const useDefaultValidation = isUninitializedValue(invalid);

		if (isUninitializedValue(invalid)) {
			invalid = false;
		}

		// Done with the trickery.
		let element;

		let instance = void 0;
		let internalClasses = {};
		let internalStyles = {};
		let selectAnchor;
		let selectAnchorAttrs = {};
		let selectedIndex = -1;
		const menuId = $.derived(() => restProps['menu$id'] ?? inputId + '-menu');
		let helperId = void 0;
		let addLayoutListener = getContext('SMUI:addLayoutListener');
		let removeLayoutListener;
		let menuOpen = false;
		let menuClasses = {};
		let anchorElement = void 0;
		let anchorCorner = void 0;
		let wrapFocus = false;
		let list;
		let context = getContext('SMUI:select:context');

		// These are instances, not accessors.
		let leadingIconInstance = undefined;

		let helperTextInstance = undefined;

		// Components
		let floatingLabel = undefined;

		let lineRipple = undefined;
		let notchedOutline = undefined;

		setContext('SMUI:list:role', '');
		setContext('SMUI:list:nav', false);

		// Only needed on initialization.
		const selectedTextStore = writable('');

		setContext('SMUI:select:selectedText', selectedTextStore);

		const valueStore = writable(value);

		setContext('SMUI:select:value', valueStore);

		let previousSelectedIndex = selectedIndex;

		/* closeMenu */
		/* skipNotify */
		if (addLayoutListener) {
			removeLayoutListener = addLayoutListener(layout);
		}

		setContext('SMUI:select:leading-icon:mount', (accessor) => {
			leadingIconInstance = accessor;
		});

		setContext('SMUI:select:leading-icon:unmount', () => {
			leadingIconInstance = undefined;
		});

		setContext('SMUI:list:mount', (accessor) => {
			list = accessor;
		});

		setContext('SMUI:select:helper-text:id', (id) => {
			helperId = id;
		});

		setContext('SMUI:select:helper-text:mount', (accessor) => {
			helperTextInstance = accessor;
		});

		setContext('SMUI:select:helper-text:unmount', () => {
			helperId = undefined;
			helperTextInstance = undefined;
		});

		onMount(() => {
			instance = new MDCSelectFoundation(
				{
					// getSelectAdapterMethods
					// getMenuItemAttr: (menuItem: Element, attr: string) =>
					//   menuItem.getAttribute(attr),
					setSelectedText: (text) => {
						$.store_set(selectedTextStore, text);
					},
					isSelectAnchorFocused: () => document.activeElement === selectAnchor,
					getSelectAnchorAttr,
					setSelectAnchorAttr: addSelectAnchorAttr,
					removeSelectAnchorAttr,
					addMenuClass,
					removeMenuClass,
					openMenu: () => {
						menuOpen = true;
					},

					closeMenu: () => {
						menuOpen = false;
					},
					getAnchorElement: () => selectAnchor,
					setMenuAnchorElement: (value) => {
						anchorElement = value;
					},

					setMenuAnchorCorner: (value) => {
						anchorCorner = value;
					},

					setMenuWrapFocus: (value) => {
						wrapFocus = value;
					},
					getSelectedIndex: () => selectedIndex,
					setSelectedIndex: (index) => {
						// Don't update the instance again.
						previousSelectedIndex = index;

						selectedIndex = index;
						value = getMenuItemValues()[selectedIndex];
					},

					focusMenuItemAtIndex: (index) => {
						list.focusItemAtIndex(index);
					},
					getMenuItemCount: () => list.items.length,
					getMenuItemValues: () => getMenuItemValues().map(key),
					getMenuItemTextAtIndex: (index) => list.getPrimaryTextAtIndex(index),
					isTypeaheadInProgress: () => list.typeaheadInProgress,
					typeaheadMatchItem: (nextChar, startingIndex) => list.typeaheadMatchItem(nextChar, startingIndex),
					// getCommonAdapterMethods
					addClass,
					removeClass,
					hasClass,
					setRippleCenter: (normalizedX) => lineRipple && lineRipple.setRippleCenter(normalizedX),
					activateBottomLine: () => lineRipple && lineRipple.activate(),
					deactivateBottomLine: () => lineRipple && lineRipple.deactivate(),
					notifyChange: (_selectedValue) => {
						dirty = true;

						if (updateInvalid) {
							invalid = !instance?.isValid();
						}

						dispatch(getElement(), 'SMUISelectChange', { value, index: selectedIndex });
					},

					// getOutlineAdapterMethods
					hasOutline: () => !!notchedOutline,
					notchOutline: (labelWidth) => notchedOutline && notchedOutline.notch(labelWidth),
					closeOutline: () => notchedOutline && notchedOutline.closeNotch(),
					// getLabelAdapterMethods
					hasLabel: () => !!floatingLabel,
					floatLabel: (shouldFloat) => floatingLabel && floatingLabel.float(shouldFloat),
					getLabelWidth: () => floatingLabel ? floatingLabel.getWidth() : 0,
					setLabelRequired: (isRequired) => floatingLabel && floatingLabel.setRequired(isRequired)
				},
				{
					get helperText() {
						return helperTextInstance;
					},

					get leadingIcon() {
						return leadingIconInstance;
					}
				}
			);

			selectedIndex = getMenuItemValues().indexOf(value);
			instance.init();
			setUseDefaultValidation(useDefaultValidation);

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

		function addMenuClass(className) {
			if (!menuClasses[className]) {
				menuClasses[className] = true;
			}
		}

		function removeMenuClass(className) {
			if (!(className in menuClasses) || menuClasses[className]) {
				menuClasses[className] = false;
			}
		}

		function getSelectAnchorAttr(name) {
			return name in selectAnchorAttrs
				? selectAnchorAttrs[name] ?? null
				: getElement().getAttribute(name);
		}

		function addSelectAnchorAttr(name, value) {
			if (selectAnchorAttrs[name] !== value) {
				selectAnchorAttrs[name] = value;
			}
		}

		function removeSelectAnchorAttr(name) {
			if (!(name in selectAnchorAttrs) || selectAnchorAttrs[name] != null) {
				selectAnchorAttrs[name] = undefined;
			}
		}

		function getMenuItemValues() {
			return list.getOrderedList().map((accessor) => accessor.getValue());
		}

		function getNormalizedXCoordinate(evt) {
			const targetClientRect = evt.currentTarget.getBoundingClientRect();
			const xCoordinate = isTouchEvent(evt) ? evt.touches[0].clientX : evt.clientX;

			return xCoordinate - targetClientRect.left;
		}

		function isTouchEvent(evt) {
			return 'touches' in evt;
		}

		function getUseDefaultValidation() {
			if (instance == null) {
				throw new Error('Instance is undefined.');
			}

			return instance.getUseDefaultValidation();
		}

		/**
		 * This is set to true automatically if you don't provide a `invalid` prop.
		 */
		function setUseDefaultValidation(useDefaultValidation) {
			instance?.setUseDefaultValidation(useDefaultValidation);
		}

		function focus() {
			selectAnchor.focus();
		}

		function layout() {
			instance?.layout();
		}

		function getElement() {
			return element;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attributes({
				class: $.clsx(classMap({
					'mdc-select': true,
					'mdc-select--required': required,
					'mdc-select--disabled': disabled,
					'mdc-select--filled': variant === 'filled',
					'mdc-select--outlined': variant === 'outlined',
					'smui-select--standard': variant === 'standard',
					'mdc-select--with-leading-icon': isUninitializedValue(withLeadingIcon) ? leadingIcon : withLeadingIcon,
					'mdc-select--no-label': noLabel || label == null,
					'mdc-select--invalid': invalid,
					'mdc-select--activated': menuOpen,
					'mdc-data-table__pagination-rows-per-page-select': context === 'data-table:pagination',
					'mdc-data-table__pagination-rows-per-page-select--outlined': context === 'data-table:pagination' && variant === 'outlined',
					...internalClasses,
					[className]: true
				})),
				style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
				...exclude(restProps, [
					'input$',
					'anchor$',
					'label$',
					'outline$',
					'selectedTextContainer$',
					'selectedText$',
					'dropdownIcon$',
					'ripple$',
					'menu$',
					'list$',
					'helperText$'
				])
			})}>`);

			if (hiddenInput) {
				$$renderer.push(`<!--[0--><input${$.attributes(
					{
						type: 'hidden',
						required,
						disabled,
						value,
						...prefixFilter(restProps, 'input$')
					},
					void 0,
					void 0,
					void 0,
					4
				)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attributes({
				class: $.clsx(classMap({ 'mdc-select__anchor': true, [anchor$class]: true })),
				'aria-required': required ? 'true' : undefined,
				'aria-disabled': disabled ? 'true' : undefined,
				'aria-controls': menuId(),
				'aria-expanded': menuOpen ? 'true' : 'false',
				'aria-describedby': helperId,
				'aria-labelledby': inputId + '-smui-label',
				role: 'combobox',
				tabindex: '0',
				...selectAnchorAttrs,
				...prefixFilter(restProps, 'anchor$')
			})}>`);

			if (variant === 'filled') {
				$$renderer.push(`<!--[0--><span class="mdc-select__ripple"></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (variant !== 'outlined' && !noLabel && label != null) {
				$$renderer.push('<!--[0-->');

				FloatingLabel($$renderer, $.spread_props([
					{
						id: inputId + '-smui-label',
						floatAbove: $.store_get($$store_subs ??= {}, '$selectedTextStore', selectedTextStore) !== '',
						required
					},
					prefixFilter(restProps, 'label$'),
					{
						children: ($$renderer) => {
							if (label == null) {
								$$renderer.push('<!--[0-->');
							} else if (typeof label === 'string') {
								$$renderer.push(`<!--[1-->${$.escape(label)}`);
							} else {
								$$renderer.push('<!--[-1-->');
								label($$renderer);
								$$renderer.push(`<!---->`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (variant === 'outlined') {
				$$renderer.push('<!--[0-->');

				NotchedOutline($$renderer, $.spread_props([
					{ noLabel: noLabel || label == null },
					prefixFilter(restProps, 'outline$'),
					{
						children: ($$renderer) => {
							if (!noLabel && label != null) {
								$$renderer.push('<!--[0-->');

								FloatingLabel($$renderer, $.spread_props([
									{
										id: inputId + '-smui-label',
										floatAbove: $.store_get($$store_subs ??= {}, '$selectedTextStore', selectedTextStore) !== '',
										required
									},
									prefixFilter(restProps, 'label$'),
									{
										children: ($$renderer) => {
											if (label == null) {
												$$renderer.push('<!--[0-->');
											} else if (typeof label === 'string') {
												$$renderer.push(`<!--[1-->${$.escape(label)}`);
											} else {
												$$renderer.push('<!--[-1-->');
												label($$renderer);
												$$renderer.push(`<!---->`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									}
								]));
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			leadingIcon?.($$renderer);

			$$renderer.push(`<!----> <span${$.attributes({
				class: $.clsx(classMap({
					'mdc-select__selected-text-container': true,
					[selectedTextContainer$class]: true
				})),
				...prefixFilter(restProps, 'selectedTextContainer$')
			})}><span${$.attributes({
				id: inputId + '-smui-selected-text',
				class: $.clsx(classMap({
					'mdc-select__selected-text': true,
					[selectedText$class]: true
				})),
				role: 'button',
				'aria-haspopup': 'listbox',
				'aria-labelledby': inputId + '-smui-label',
				...prefixFilter(restProps, 'selectedText$')
			})}>${$.escape($.store_get($$store_subs ??= {}, '$selectedTextStore', selectedTextStore))}</span></span> <span${$.attributes({
				class: $.clsx(classMap({
					'mdc-select__dropdown-icon': true,
					[dropdownIcon$class]: true
				})),
				...prefixFilter(restProps, 'dropdownIcon$')
			})}><svg class="mdc-select__dropdown-icon-graphic" viewBox="7 10 10 5" focusable="false"><polygon class="mdc-select__dropdown-icon-inactive" stroke="none" fill-rule="evenodd" points="7 10 12 15 17 10"></polygon><polygon class="mdc-select__dropdown-icon-active" stroke="none" fill-rule="evenodd" points="7 15 12 10 17 15"></polygon></svg></span> `);

			if (variant !== 'outlined' && ripple) {
				$$renderer.push('<!--[0-->');
				LineRipple($$renderer, $.spread_props([prefixFilter(restProps, 'ripple$')]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			Menu($$renderer, $.spread_props([
				{
					class: classMap({ 'mdc-select__menu': true, ...menuClasses, [menu$class]: true }),
					id: menuId(),
					fullWidth: true,
					anchor: false,
					anchorElement,
					anchorCorner
				},
				prefixFilter(restProps, 'menu$'),
				{
					onSMUIMenuSelected: (e) => {
						if (instance) {
							instance.handleMenuItemAction(e.detail.index);
						}

						restProps.onSMUIMenuSelected?.(e);
					},

					onSMUIMenuSurfaceClosing: (e) => {
						if (instance) {
							instance.handleMenuClosing();
						}

						restProps.onSMUIMenuSurfaceClosing?.(e);
					},

					onSMUIMenuSurfaceClosed: (e) => {
						if (instance) {
							instance.handleMenuClosed();
						}

						restProps.onSMUIMenuSurfaceClosed?.(e);
					},

					onSMUIMenuSurfaceOpened: (e) => {
						if (instance) {
							instance.handleMenuOpened();
						}

						restProps.onSMUIMenuSurfaceOpened?.(e);
					},

					get open() {
						return menuOpen;
					},

					set open($$value) {
						menuOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						List($$renderer, $.spread_props([
							{ role: 'listbox', wrapFocus },
							prefixFilter(restProps, 'list$'),
							{
								get selectedIndex() {
									return selectedIndex;
								},

								set selectedIndex($$value) {
									selectedIndex = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									children?.($$renderer);
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							}
						]));
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push(`<!----></div> `);

			if (helperText) {
				$$renderer.push('<!--[0-->');

				HelperText($$renderer, $.spread_props([
					prefixFilter(restProps, 'helperText$'),
					{
						children: ($$renderer) => {
							helperText?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, {
			value,
			dirty,
			invalid,
			getUseDefaultValidation,
			setUseDefaultValidation,
			focus,
			layout,
			getElement
		});
	});
}