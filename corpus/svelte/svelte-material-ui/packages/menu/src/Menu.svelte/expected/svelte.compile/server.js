import * as $ from 'svelte/internal/server';
import { onMount, getContext, setContext } from 'svelte';
import { ponyfill } from '@smui/common/dom';
import { classMap, dispatch } from '@smui/common/internal';
import MenuSurface from '@smui/menu-surface';
import { MDCMenuFoundation, cssClasses } from './mdc';

export default function Menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { closest } = ponyfill;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether the menu is open.
		 */
		/**
		 * A managed menu means you completely control the open state. The component
		 * will never alter it on its own.
		 */
		let {
			use = [],
			class: className = '',
			open = false,
			anchorElement = void 0,
			managed = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let menuSurfaceAccessor = void 0;
		let listAccessor = void 0;

		setContext('SMUI:menu-surface:mount', (accessor) => {
			if (!menuSurfaceAccessor) {
				menuSurfaceAccessor = accessor;
			}
		});

		const SMUIListMount = getContext('SMUI:list:mount');

		setContext('SMUI:list:mount', (accessor) => {
			if (!listAccessor) {
				listAccessor = accessor;
			}

			SMUIListMount && SMUIListMount(accessor);
		});

		const SMUIMenuMount = getContext('SMUI:menu:mount');
		const SMUIMenuUnmount = getContext('SMUI:menu:unmount');

		onMount(() => {
			instance = new MDCMenuFoundation({
				addClassToElementAtIndex: (index, className) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					listAccessor.addClassForElementIndex(index, className);
				},

				removeClassFromElementAtIndex: (index, className) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					listAccessor.removeClassForElementIndex(index, className);
				},

				addAttributeToElementAtIndex: (index, attr, value) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					listAccessor.setAttributeForElementIndex(index, attr, value);
				},

				removeAttributeFromElementAtIndex: (index, attr) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					listAccessor.removeAttributeForElementIndex(index, attr);
				},

				getAttributeFromElementAtIndex: (index, attr) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					return listAccessor.getAttributeFromElementIndex(index, attr);
				},
				elementContainsClass: (element, className) => element.classList.contains(className),
				closeSurface: (skipRestoreFocus) => {
					if (!managed && getElement()) {
						menuSurfaceAccessor?.closeProgrammatic(skipRestoreFocus);
						dispatch(getElement(), 'SMUIMenuClosedProgrammatically');
					}
				},

				getElementIndex: (element) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					return listAccessor.getOrderedList().map((accessor) => accessor.element).indexOf(element);
				},

				notifySelected: (evtData) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					dispatch(getElement(), 'SMUIMenuSelected', {
						index: evtData.index,
						item: listAccessor.getOrderedList()[evtData.index].element
					});
				},

				getMenuItemCount: () => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					return listAccessor.items.length;
				},

				focusItemAtIndex: (index) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					listAccessor.focusItemAtIndex(index);
				},

				focusListRoot: () => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					if ('focus' in listAccessor.element) {
						listAccessor.element.focus();
					}
				},

				isSelectableItemAtIndex: (index) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					return !!closest(listAccessor.getOrderedList()[index].element, `.${cssClasses.MENU_SELECTION_GROUP}`);
				},

				getSelectedSiblingOfItemAtIndex: (index) => {
					if (listAccessor == null) {
						throw new Error('List accessor is undefined.');
					}

					const orderedList = listAccessor.getOrderedList();
					const selectionGroupEl = closest(orderedList[index].element, `.${cssClasses.MENU_SELECTION_GROUP}`);
					const selectedItemEl = selectionGroupEl?.querySelector(`.${cssClasses.MENU_SELECTED_LIST_ITEM}`);

					return selectedItemEl
						? orderedList.map((item) => item.element).indexOf(selectedItemEl)
						: -1;
				}
			});

			SMUIMenuMount && SMUIMenuMount(instance);
			instance.init();

			return () => {
				if (SMUIMenuUnmount && instance) {
					SMUIMenuUnmount(instance);
				}

				instance?.destroy();
				instance = undefined;
			};
		});

		function handleKeydown(event) {
			instance && instance.handleKeydown(event);
		}

		function isOpen() {
			return open;
		}

		function setOpen(value) {
			open = value;
		}

		function setDefaultFocusState(focusState) {
			if (instance == null) {
				throw new Error('Instance is undefined.');
			}

			instance.setDefaultFocusState(focusState);
		}

		function getSelectedIndex() {
			if (instance == null) {
				throw new Error('Instance is undefined.');
			}

			return instance.getSelectedIndex();
		}

		function getMenuSurface() {
			return element;
		}

		function getElement() {
			return element.getElement();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MenuSurface($$renderer, $.spread_props([
				{
					use,
					class: classMap({ 'mdc-menu': true, [className]: true }),
					managed
				},
				restProps,
				{
					onkeydown: (e) => {
						handleKeydown(e);
						restProps.onkeydown?.(e);
					},

					onSMUIMenuSurfaceOpened: (e) => {
						if (instance) {
							instance.handleMenuSurfaceOpened();
						}

						restProps.onSMUIMenuSurfaceOpened?.(e);
					},

					onSMUIListAction: (e) => {
						if (instance && listAccessor) {
							instance.handleItemAction(listAccessor.getOrderedList()[e.detail.index].element);
						}

						restProps.onSMUIListAction?.(e);
					},

					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					get anchorElement() {
						return anchorElement;
					},

					set anchorElement($$value) {
						anchorElement = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		$.bind_props($$props, {
			open,
			anchorElement,
			isOpen,
			setOpen,
			setDefaultFocusState,
			getSelectedIndex,
			getMenuSurface,
			getElement
		});
	});
}