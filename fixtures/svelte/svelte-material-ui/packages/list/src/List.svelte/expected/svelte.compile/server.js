import * as $ from 'svelte/internal/server';
import { onMount, onDestroy, getContext, setContext } from 'svelte';
import { ponyfill } from '@smui/common/dom';
import { classMap, dispatch } from '@smui/common/internal';
import { SmuiElement } from '@smui/common';
import { MDCListFoundation } from './mdc';

export default function List($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { closest, matches } = ponyfill;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether the list should ignore all user input.
		 */
		/**
		 * Style the list more compact.
		 */
		/**
		 * Style the list as a text list.
		 */
		/**
		 * Style the list as an avatar list.
		 */
		/**
		 * Style the list as an icon list.
		 */
		/**
		 * Style the list as an image list.
		 */
		/**
		 * Style the list as a thumbnail list.
		 */
		/**
		 * Style the list as a video list.
		 */
		/**
		 * Style the list as a two line list.
		 */
		/**
		 * Style the list as a three line list.
		 */
		/**
		 * Set the list to vertical orientation.
		 */
		/**
		 * Whether to wrap focus around the end of the list.
		 */
		/**
		 * Allow a single selection from the list.
		 */
		/**
		 * Whether disabled items should be focusable.
		 */
		/**
		 * The selected item's index.
		 */
		/**
		 * Whether the list is a radio button list.
		 */
		/**
		 * Whether the list is a checkbox list.
		 */
		/**
		 * Whether the list has typeahead.
		 */
		/**
		 * The component to use to render the element.
		 */
		/**
		 * The tag name of the element to create.
		 */
		let nav = getContext('SMUI:list:nav');

		let {
			use = [],
			class: className = '',
			nonInteractive = false,
			dense = false,
			textualList = false,
			avatarList = false,
			iconList = false,
			imageList = false,
			thumbnailList = false,
			videoList = false,
			twoLine = false,
			threeLine = false,
			vertical = true,
			wrapFocus = getContext('SMUI:list:wrapFocus') ?? false,
			singleSelection = false,
			disabledItemsFocusable = false,
			selectedIndex = -1,
			radioList = false,
			checkList = false,
			hasTypeahead = false,
			component: MyComponent = SmuiElement,
			tag = nav ? 'nav' : 'ul',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let items = [];
		let role = getContext('SMUI:list:role');
		const itemAccessorMap = new WeakMap();
		let selectionDialog = getContext('SMUI:dialog:selection');
		let addLayoutListener = getContext('SMUI:addLayoutListener');
		let removeLayoutListener;

		setContext('SMUI:list:nonInteractive', nonInteractive);
		setContext('SMUI:separator:context', 'list');

		if (!role) {
			if (singleSelection) {
				role = 'listbox';
				setContext('SMUI:list:item:role', 'option');
			} else if (radioList) {
				role = 'radiogroup';
				setContext('SMUI:list:item:role', 'radio');
			} else if (checkList) {
				role = 'group';
				setContext('SMUI:list:item:role', 'checkbox');
			} else {
				role = 'list';
				setContext('SMUI:list:item:role', undefined);
			}
		}

		if (addLayoutListener) {
			removeLayoutListener = addLayoutListener(layout);
		}

		setContext('SMUI:list:item:mount', (accessor) => {
			items.push(accessor);
			itemAccessorMap.set(accessor.element, accessor);

			if (singleSelection && accessor.selected) {
				selectedIndex = getListItemIndex(accessor.element);
			}
		});

		setContext('SMUI:list:item:unmount', (accessor) => {
			const idx = (accessor && items.findIndex((a) => a === accessor)) ?? -1;

			if (idx !== -1) {
				items.splice(idx, 1);
				itemAccessorMap.delete(accessor.element);
			}
		});

		const SMUIListMount = getContext('SMUI:list:mount');
		const SMUIListUnmount = getContext('SMUI:list:unmount');

		onMount(() => {
			instance = new MDCListFoundation({
				addClassForElementIndex,
				focusItemAtIndex,
				getAttributeForElementIndex: (index, name) => getOrderedList()[index]?.getAttr(name) ?? null,
				getFocusedElementIndex: () => document.activeElement
					? getOrderedList().map((accessor) => accessor.element).indexOf(document.activeElement)
					: -1,
				getListItemCount: () => items.length,
				getPrimaryTextAtIndex,
				hasCheckboxAtIndex: (index) => getOrderedList()[index]?.hasCheckbox ?? false,
				hasRadioAtIndex: (index) => getOrderedList()[index]?.hasRadio ?? false,
				isCheckboxCheckedAtIndex: (index) => {
					const listItem = getOrderedList()[index];

					return (listItem?.hasCheckbox && listItem.checked) ?? false;
				},
				isFocusInsideList: () => element != null && getElement() !== document.activeElement && getElement().contains(document.activeElement),
				isRootFocused: () => element != null && document.activeElement === getElement(),
				listItemAtIndexHasClass,
				notifyAction: (index) => {
					selectedIndex = index;

					if (element != null) {
						dispatch(getElement(), 'SMUIListAction', { index });
					}
				},

				notifySelectionChange: (changedIndices) => {
					if (element != null) {
						dispatch(getElement(), 'SMUIListSelectionChange', { changedIndices });
					}
				},
				removeClassForElementIndex,
				setAttributeForElementIndex,
				setCheckedCheckboxOrRadioAtIndex: (index, isChecked) => {
					getOrderedList()[index].checked = isChecked;
				},

				setTabIndexForListItemChildren: (listItemIndex, tabIndexValue) => {
					const listItem = getOrderedList()[listItemIndex];
					const selector = 'button:not(:disabled), a';

					Array.prototype.forEach.call(listItem.element.querySelectorAll(selector), (el) => {
						el.setAttribute('tabindex', tabIndexValue);
					});
				}
			});

			const accessor = {
				get element() {
					return getElement();
				},

				get items() {
					return items;
				},

				get typeaheadInProgress() {
					if (!instance) {
						throw new Error('Instance is undefined.');
					}

					return instance.isTypeaheadInProgress();
				},

				typeaheadMatchItem(nextChar, startingIndex) {
					if (!instance) {
						throw new Error('Instance is undefined.');
					}

					return instance.typeaheadMatchItem(nextChar, startingIndex, /** skipFocus */ true);
				},
				getOrderedList,
				focusItemAtIndex,
				addClassForElementIndex,
				removeClassForElementIndex,
				setAttributeForElementIndex,
				removeAttributeForElementIndex,
				getAttributeFromElementIndex,
				getPrimaryTextAtIndex
			};

			SMUIListMount && SMUIListMount(accessor);
			instance.init();
			instance.layout();

			return () => {
				SMUIListUnmount && SMUIListUnmount(accessor);
				instance?.destroy();
				instance = undefined;
			};
		});

		onDestroy(() => {
			if (removeLayoutListener) {
				removeLayoutListener();
			}
		});

		function handleKeydown(event) {
			if (instance && event.target) {
				instance.handleKeydown(event, event.target.classList.contains('mdc-deprecated-list-item'), getListItemIndex(event.target));
			}
		}

		function handleFocusin(event) {
			if (instance && event.target) {
				instance.handleFocusIn(getListItemIndex(event.target));
			}
		}

		function handleFocusout(event) {
			if (instance && event.target) {
				instance.handleFocusOut(getListItemIndex(event.target));
			}
		}

		function handleClick(event) {
			if (instance && event.target) {
				instance.handleClick(getListItemIndex(event.target), !matches(event.target, 'input[type="checkbox"], input[type="radio"]'), event);
			}
		}

		function handleAction(event) {
			if (radioList || checkList) {
				const index = getListItemIndex(event.target);

				if (index !== -1) {
					const item = getOrderedList()[index];

					if (item && (radioList && !item.checked || checkList)) {
						if (!matches(event.detail.target, 'input[type="checkbox"], input[type="radio"]')) {
							item.checked = !item.checked;
						}

						item.activateRipple();

						window.requestAnimationFrame(() => {
							item.deactivateRipple();
						});
					}
				}
			}
		}

		function getOrderedList() {
			if (element == null) {
				return [];
			}

			return [...getElement().children].map((element) => itemAccessorMap.get(element)).filter((accessor) => accessor && accessor._smui_list_item_accessor);
		}

		function listItemAtIndexHasClass(index, className) {
			const accessor = getOrderedList()[index];

			return (accessor && accessor.hasClass(className)) ?? false;
		}

		function addClassForElementIndex(index, className) {
			const accessor = getOrderedList()[index];

			accessor && accessor.addClass(className);
		}

		function removeClassForElementIndex(index, className) {
			const accessor = getOrderedList()[index];

			accessor && accessor.removeClass(className);
		}

		function setAttributeForElementIndex(index, name, value) {
			const accessor = getOrderedList()[index];

			accessor && accessor.addAttr(name, value);
		}

		function removeAttributeForElementIndex(index, name) {
			const accessor = getOrderedList()[index];

			accessor && accessor.removeAttr(name);
		}

		function getAttributeFromElementIndex(index, name) {
			const accessor = getOrderedList()[index];

			if (accessor) {
				return accessor.getAttr(name);
			} else {
				return null;
			}
		}

		function getPrimaryTextAtIndex(index) {
			const accessor = getOrderedList()[index];

			return (accessor && accessor.getPrimaryText()) ?? '';
		}

		function getListItemIndex(element) {
			const nearestParent = closest(element, '.mdc-deprecated-list-item, .mdc-deprecated-list');

			// Get the index of the element if it is a list item.
			if (nearestParent && matches(nearestParent, '.mdc-deprecated-list-item')) {
				return getOrderedList().map((item) => item?.element).indexOf(nearestParent);
			}

			return -1;
		}

		function layout() {
			if (!instance) {
				throw new Error('Instance is undefined.');
			}

			return instance.layout();
		}

		function setEnabled(itemIndex, isEnabled) {
			if (!instance) {
				throw new Error('Instance is undefined.');
			}

			return instance.setEnabled(itemIndex, isEnabled);
		}

		function getTypeaheadInProgress() {
			if (!instance) {
				throw new Error('Instance is undefined.');
			}

			return instance.isTypeaheadInProgress();
		}

		function getSelectedIndex() {
			if (!instance) {
				throw new Error('Instance is undefined.');
			}

			return instance.getSelectedIndex();
		}

		function getFocusedItemIndex() {
			if (!instance) {
				throw new Error('Instance is undefined.');
			}

			return instance.getFocusedItemIndex();
		}

		function focusItemAtIndex(index) {
			const accessor = getOrderedList()[index];

			accessor && 'focus' in accessor.element && accessor.element.focus();
		}

		function getElement() {
			return element.getElement();
		}

		if (MyComponent) {
			$$renderer.push('<!--[-->');

			MyComponent($$renderer, $.spread_props([
				{
					tag,
					use,
					class: classMap({
						'mdc-deprecated-list': true,
						'mdc-deprecated-list--non-interactive': nonInteractive,
						'mdc-deprecated-list--dense': dense,
						'mdc-deprecated-list--textual-list': textualList,
						'mdc-deprecated-list--avatar-list': avatarList || selectionDialog,
						'mdc-deprecated-list--icon-list': iconList,
						'mdc-deprecated-list--image-list': imageList,
						'mdc-deprecated-list--thumbnail-list': thumbnailList,
						'mdc-deprecated-list--video-list': videoList,
						'mdc-deprecated-list--two-line': twoLine,
						'smui-list--three-line': threeLine && !twoLine,
						[className]: true
					}),
					role
				},
				restProps,
				{
					onkeydown: (e) => {
						handleKeydown(e);
						restProps.onkeydown?.(e);
					},

					onfocusin: (e) => {
						handleFocusin(e);
						restProps.onfocusin?.(e);
					},

					onfocusout: (e) => {
						handleFocusout(e);
						restProps.onfocusout?.(e);
					},

					onclick: (e) => {
						handleClick(e);
						restProps.onclick?.(e);
					},

					onSMUIAction: (e) => {
						handleAction(e);
						restProps.onSMUIAction?.(e);
					},

					children: ($$renderer) => {
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
			selectedIndex,
			layout,
			setEnabled,
			getTypeaheadInProgress,
			getSelectedIndex,
			getFocusedItemIndex,
			focusItemAtIndex,
			getElement
		});
	});
}