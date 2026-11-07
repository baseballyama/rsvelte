import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy, getContext, setContext } from 'svelte';
import { ponyfill } from '@smui/common/dom';
import { classMap, dispatch } from '@smui/common/internal';
import { SmuiElement } from '@smui/common';
import { MDCListFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'nonInteractive',
	'dense',
	'textualList',
	'avatarList',
	'iconList',
	'imageList',
	'thumbnailList',
	'videoList',
	'twoLine',
	'threeLine',
	'vertical',
	'wrapFocus',
	'singleSelection',
	'disabledItemsFocusable',
	'selectedIndex',
	'radioList',
	'checkList',
	'hasTypeahead',
	'component',
	'tag',
	'children'
]);

export default function List($$anchor, $$props) {
	$.push($$props, true);

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

	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		nonInteractive = $.prop($$props, 'nonInteractive', 3, false),
		dense = $.prop($$props, 'dense', 3, false),
		textualList = $.prop($$props, 'textualList', 3, false),
		avatarList = $.prop($$props, 'avatarList', 3, false),
		iconList = $.prop($$props, 'iconList', 3, false),
		imageList = $.prop($$props, 'imageList', 3, false),
		thumbnailList = $.prop($$props, 'thumbnailList', 3, false),
		videoList = $.prop($$props, 'videoList', 3, false),
		twoLine = $.prop($$props, 'twoLine', 3, false),
		threeLine = $.prop($$props, 'threeLine', 3, false),
		vertical = $.prop($$props, 'vertical', 3, true),
		wrapFocus = $.prop($$props, 'wrapFocus', 19, () => getContext('SMUI:list:wrapFocus') ?? false),
		singleSelection = $.prop($$props, 'singleSelection', 3, false),
		disabledItemsFocusable = $.prop($$props, 'disabledItemsFocusable', 3, false),
		selectedIndex = $.prop($$props, 'selectedIndex', 31, () => -1),
		radioList = $.prop($$props, 'radioList', 3, false),
		checkList = $.prop($$props, 'checkList', 3, false),
		hasTypeahead = $.prop($$props, 'hasTypeahead', 3, false),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, nav ? 'nav' : 'ul'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let items = [];
	let role = getContext('SMUI:list:role');
	const itemAccessorMap = new WeakMap();
	let selectionDialog = getContext('SMUI:dialog:selection');
	let addLayoutListener = getContext('SMUI:addLayoutListener');
	let removeLayoutListener;

	setContext('SMUI:list:nonInteractive', nonInteractive());
	setContext('SMUI:separator:context', 'list');

	if (!role) {
		if (singleSelection()) {
			role = 'listbox';
			setContext('SMUI:list:item:role', 'option');
		} else if (radioList()) {
			role = 'radiogroup';
			setContext('SMUI:list:item:role', 'radio');
		} else if (checkList()) {
			role = 'group';
			setContext('SMUI:list:item:role', 'checkbox');
		} else {
			role = 'list';
			setContext('SMUI:list:item:role', undefined);
		}
	}

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setVerticalOrientation(vertical());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setWrapFocus(wrapFocus());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setHasTypeahead(hasTypeahead());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setSingleSelection(singleSelection());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setDisabledItemsFocusable(disabledItemsFocusable());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && singleSelection() && getSelectedIndex() !== selectedIndex()) {
			$.get(instance).setSelectedIndex(selectedIndex());
		}
	});

	if (addLayoutListener) {
		removeLayoutListener = addLayoutListener(layout);
	}

	setContext('SMUI:list:item:mount', (accessor) => {
		items.push(accessor);
		itemAccessorMap.set(accessor.element, accessor);

		if (singleSelection() && accessor.selected) {
			selectedIndex(getListItemIndex(accessor.element));
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
		$.set(
			instance,
			new MDCListFoundation({
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
					selectedIndex(index);

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
			}),
			true
		);

		const accessor = {
			get element() {
				return getElement();
			},

			get items() {
				return items;
			},

			get typeaheadInProgress() {
				if (!$.get(instance)) {
					throw new Error('Instance is undefined.');
				}

				return $.get(instance).isTypeaheadInProgress();
			},

			typeaheadMatchItem(nextChar, startingIndex) {
				if (!$.get(instance)) {
					throw new Error('Instance is undefined.');
				}

				return $.get(instance).typeaheadMatchItem(nextChar, startingIndex, /** skipFocus */ true);
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
		$.get(instance).init();
		$.get(instance).layout();

		return () => {
			SMUIListUnmount && SMUIListUnmount(accessor);
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	onDestroy(() => {
		if (removeLayoutListener) {
			removeLayoutListener();
		}
	});

	function handleKeydown(event) {
		if ($.get(instance) && event.target) {
			$.get(instance).handleKeydown(event, event.target.classList.contains('mdc-deprecated-list-item'), getListItemIndex(event.target));
		}
	}

	function handleFocusin(event) {
		if ($.get(instance) && event.target) {
			$.get(instance).handleFocusIn(getListItemIndex(event.target));
		}
	}

	function handleFocusout(event) {
		if ($.get(instance) && event.target) {
			$.get(instance).handleFocusOut(getListItemIndex(event.target));
		}
	}

	function handleClick(event) {
		if ($.get(instance) && event.target) {
			$.get(instance).handleClick(getListItemIndex(event.target), !matches(event.target, 'input[type="checkbox"], input[type="radio"]'), event);
		}
	}

	function handleAction(event) {
		if (radioList() || checkList()) {
			const index = getListItemIndex(event.target);

			if (index !== -1) {
				const item = getOrderedList()[index];

				if (item && (radioList() && !item.checked || checkList())) {
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
		if (!$.get(instance)) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).layout();
	}

	function setEnabled(itemIndex, isEnabled) {
		if (!$.get(instance)) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).setEnabled(itemIndex, isEnabled);
	}

	function getTypeaheadInProgress() {
		if (!$.get(instance)) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).isTypeaheadInProgress();
	}

	function getSelectedIndex() {
		if (!$.get(instance)) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).getSelectedIndex();
	}

	function getFocusedItemIndex() {
		if (!$.get(instance)) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).getFocusedItemIndex();
	}

	function focusItemAtIndex(index) {
		const accessor = getOrderedList()[index];

		accessor && 'focus' in accessor.element && accessor.element.focus();
	}

	function getElement() {
		return element.getElement();
	}

	var $$exports = {
		layout,
		setEnabled,
		getTypeaheadInProgress,
		getSelectedIndex,
		getFocusedItemIndex,
		focusItemAtIndex,
		getElement
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => classMap({
			'mdc-deprecated-list': true,
			'mdc-deprecated-list--non-interactive': nonInteractive(),
			'mdc-deprecated-list--dense': dense(),
			'mdc-deprecated-list--textual-list': textualList(),
			'mdc-deprecated-list--avatar-list': avatarList() || selectionDialog,
			'mdc-deprecated-list--icon-list': iconList(),
			'mdc-deprecated-list--image-list': imageList(),
			'mdc-deprecated-list--thumbnail-list': thumbnailList(),
			'mdc-deprecated-list--video-list': videoList(),
			'mdc-deprecated-list--two-line': twoLine(),
			'smui-list--three-line': threeLine() && !twoLine(),
			[className()]: true
		}));

		$.component(node, MyComponent, ($$anchor, MyComponent_1) => {
			$.bind_this(
				MyComponent_1($$anchor, $.spread_props(
					{
						get tag() {
							return tag();
						},

						get use() {
							return use();
						},

						get class() {
							return $.get($0);
						},

						get role() {
							return role;
						}
					},
					() => restProps,
					{
						onkeydown: (e) => {
							handleKeydown(e);
							$$props.onkeydown?.(e);
						},

						onfocusin: (e) => {
							handleFocusin(e);
							$$props.onfocusin?.(e);
						},

						onfocusout: (e) => {
							handleFocusout(e);
							$$props.onfocusout?.(e);
						},

						onclick: (e) => {
							handleClick(e);
							$$props.onclick?.(e);
						},

						onSMUIAction: (e) => {
							handleAction(e);
							$$props.onSMUIAction?.(e);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_1 = $.first_child(fragment_1);

							$.snippet(node_1, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}
				)),
				($$value) => element = $$value,
				() => element
			);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}