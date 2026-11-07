import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext, setContext } from 'svelte';
import { ponyfill } from '@smui/common/dom';
import { classMap, dispatch } from '@smui/common/internal';
import MenuSurface from '@smui/menu-surface';
import { MDCMenuFoundation, cssClasses } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'open',
	'anchorElement',
	'managed',
	'children'
]);

export default function Menu($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		open = $.prop($$props, 'open', 15, false),
		anchorElement = $.prop($$props, 'anchorElement', 15),
		managed = $.prop($$props, 'managed', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let menuSurfaceAccessor = $.state(void 0);
	let listAccessor = $.state(void 0);

	setContext('SMUI:menu-surface:mount', (accessor) => {
		if (!$.get(menuSurfaceAccessor)) {
			$.set(menuSurfaceAccessor, accessor, true);
		}
	});

	const SMUIListMount = getContext('SMUI:list:mount');

	setContext('SMUI:list:mount', (accessor) => {
		if (!$.get(listAccessor)) {
			$.set(listAccessor, accessor, true);
		}

		SMUIListMount && SMUIListMount(accessor);
	});

	const SMUIMenuMount = getContext('SMUI:menu:mount');
	const SMUIMenuUnmount = getContext('SMUI:menu:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCMenuFoundation({
				addClassToElementAtIndex: (index, className) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					$.get(listAccessor).addClassForElementIndex(index, className);
				},

				removeClassFromElementAtIndex: (index, className) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					$.get(listAccessor).removeClassForElementIndex(index, className);
				},

				addAttributeToElementAtIndex: (index, attr, value) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					$.get(listAccessor).setAttributeForElementIndex(index, attr, value);
				},

				removeAttributeFromElementAtIndex: (index, attr) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					$.get(listAccessor).removeAttributeForElementIndex(index, attr);
				},

				getAttributeFromElementAtIndex: (index, attr) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					return $.get(listAccessor).getAttributeFromElementIndex(index, attr);
				},
				elementContainsClass: (element, className) => element.classList.contains(className),
				closeSurface: (skipRestoreFocus) => {
					if (!managed() && getElement()) {
						$.get(menuSurfaceAccessor)?.closeProgrammatic(skipRestoreFocus);
						dispatch(getElement(), 'SMUIMenuClosedProgrammatically');
					}
				},

				getElementIndex: (element) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					return $.get(listAccessor).getOrderedList().map((accessor) => accessor.element).indexOf(element);
				},

				notifySelected: (evtData) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					dispatch(getElement(), 'SMUIMenuSelected', {
						index: evtData.index,
						item: $.get(listAccessor).getOrderedList()[evtData.index].element
					});
				},

				getMenuItemCount: () => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					return $.get(listAccessor).items.length;
				},

				focusItemAtIndex: (index) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					$.get(listAccessor).focusItemAtIndex(index);
				},

				focusListRoot: () => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					if ('focus' in $.get(listAccessor).element) {
						$.get(listAccessor).element.focus();
					}
				},

				isSelectableItemAtIndex: (index) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					return !!closest($.get(listAccessor).getOrderedList()[index].element, `.${cssClasses.MENU_SELECTION_GROUP}`);
				},

				getSelectedSiblingOfItemAtIndex: (index) => {
					if ($.get(listAccessor) == null) {
						throw new Error('List accessor is undefined.');
					}

					const orderedList = $.get(listAccessor).getOrderedList();
					const selectionGroupEl = closest(orderedList[index].element, `.${cssClasses.MENU_SELECTION_GROUP}`);
					const selectedItemEl = selectionGroupEl?.querySelector(`.${cssClasses.MENU_SELECTED_LIST_ITEM}`);

					return selectedItemEl
						? orderedList.map((item) => item.element).indexOf(selectedItemEl)
						: -1;
				}
			}),
			true
		);

		SMUIMenuMount && SMUIMenuMount($.get(instance));
		$.get(instance).init();

		return () => {
			if (SMUIMenuUnmount && $.get(instance)) {
				SMUIMenuUnmount($.get(instance));
			}

			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function handleKeydown(event) {
		$.get(instance) && $.get(instance).handleKeydown(event);
	}

	function isOpen() {
		return open();
	}

	function setOpen(value) {
		open(value);
	}

	function setDefaultFocusState(focusState) {
		if ($.get(instance) == null) {
			throw new Error('Instance is undefined.');
		}

		$.get(instance).setDefaultFocusState(focusState);
	}

	function getSelectedIndex() {
		if ($.get(instance) == null) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).getSelectedIndex();
	}

	function getMenuSurface() {
		return element;
	}

	function getElement() {
		return element.getElement();
	}

	var $$exports = {
		isOpen,
		setOpen,
		setDefaultFocusState,
		getSelectedIndex,
		getMenuSurface,
		getElement
	};

	{
		let $0 = $.derived(() => classMap({ 'mdc-menu': true, [className()]: true }));

		$.bind_this(
			MenuSurface($$anchor, $.spread_props(
				{
					get use() {
						return use();
					},

					get class() {
						return $.get($0);
					},

					get managed() {
						return managed();
					}
				},
				() => restProps,
				{
					onkeydown: (e) => {
						handleKeydown(e);
						$$props.onkeydown?.(e);
					},

					onSMUIMenuSurfaceOpened: (e) => {
						if ($.get(instance)) {
							$.get(instance).handleMenuSurfaceOpened();
						}

						$$props.onSMUIMenuSurfaceOpened?.(e);
					},

					onSMUIListAction: (e) => {
						if ($.get(instance) && $.get(listAccessor)) {
							$.get(instance).handleItemAction($.get(listAccessor).getOrderedList()[e.detail.index].element);
						}

						$$props.onSMUIListAction?.(e);
					},

					get open() {
						return open();
					},

					set open($$value) {
						open($$value);
					},

					get anchorElement() {
						return anchorElement();
					},

					set anchorElement($$value) {
						anchorElement($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node = $.first_child(fragment_1);

						$.snippet(node, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			)),
			($$value) => element = $$value,
			() => element
		);
	}

	return $.pop($$exports);
}