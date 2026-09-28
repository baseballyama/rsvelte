import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext, getContext } from 'svelte';
import { classMap, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';

let counter = 0;

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'color',
	'nonInteractive',
	'ripple',
	'wrapper',
	'activated',
	'role',
	'selected',
	'disabled',
	'skipRestoreFocus',
	'tabindex',
	'inputId',
	'href',
	'component',
	'tag',
	'children'
]);

var root = $.from_html(`<span class="mdc-deprecated-list-item__ripple"></span>`);
var root_1 = $.from_html(`<!><!>`, 1);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

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

	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		nonInteractive = $.prop($$props, 'nonInteractive', 19, () => getContext('SMUI:list:nonInteractive') ?? false),
		ripple = $.prop($$props, 'ripple', 19, () => !nonInteractive()),
		wrapper = $.prop($$props, 'wrapper', 3, false),
		activated = $.prop($$props, 'activated', 15, false),
		role = $.prop($$props, 'role', 19, () => wrapper() ? 'presentation' : getContext('SMUI:list:item:role')),
		selected = $.prop($$props, 'selected', 15, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		skipRestoreFocus = $.prop($$props, 'skipRestoreFocus', 3, false),
		tabindexProp = $.prop($$props, 'tabindex', 15, uninitializedValue),
		inputId = $.prop($$props, 'inputId', 19, () => 'SMUI-form-field-list-' + counter++),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 19, () => nav ? $$props.href ? 'a' : 'span' : 'li'),
		restProps = $.rest_props($$props, rest_excludes);

	setContext('SMUI:list:nonInteractive', undefined);
	setContext('SMUI:list:item:role', undefined);

	let element;
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let internalAttrs = $.proxy({});
	let input = $.state(void 0);
	let addTabindexIfNoItemsSelectedRaf = $.state(void 0);

	const tabindex = $.derived(() => isUninitializedValue(tabindexProp())
		? !nonInteractive() && !disabled() && (selected() || $.get(input) && $.get(input).checked) ? 0 : -1
		: tabindexProp());

	setContext('SMUI:generic:input:props', { id: inputId() });

	// Reset separator context, because we aren't directly under a list anymore.
	setContext('SMUI:separator:context', undefined);

	setContext('SMUI:generic:input:mount', (accessor) => {
		if ('_smui_checkbox_accessor' in accessor || '_smui_radio_accessor' in accessor) {
			$.set(input, accessor, true);
		}
	});

	setContext('SMUI:generic:input:unmount', () => {
		$.set(input, undefined);
	});

	const SMUIListItemMount = getContext('SMUI:list:item:mount');
	const SMUIListItemUnmount = getContext('SMUI:list:item:unmount');

	onMount(() => {
		// Tabindex needs to be '0' if this is the first non-disabled list item, and
		// no other item is selected.
		if (!selected() && !nonInteractive() && element) {
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
				$.set(addTabindexIfNoItemsSelectedRaf, window.requestAnimationFrame(() => addTabindexIfNoItemsSelected(el)), true);
			}
		}

		const accessor = {
			_smui_list_item_accessor: true,
			get element() {
				return getElement();
			},

			get selected() {
				return selected();
			},

			set selected(value) {
				selected(value);
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
				return ($.get(input) && $.get(input).checked) ?? false;
			},

			set checked(value) {
				if ($.get(input)) {
					$.get(input).checked = !!value;
				}
			},

			get hasCheckbox() {
				return !!($.get(input) && '_smui_checkbox_accessor' in $.get(input));
			},

			get hasRadio() {
				return !!($.get(input) && '_smui_radio_accessor' in $.get(input));
			},

			activateRipple() {
				if ($.get(input)) {
					$.get(input).activateRipple();
				}
			},

			deactivateRipple() {
				if ($.get(input)) {
					$.get(input).deactivateRipple();
				}
			},

			// For select options.
			getValue() {
				return $$props.value;
			},

			// For autocomplete
			action,

			get tabindex() {
				return $.get(tabindex);
			},

			set tabindex(value) {
				tabindexProp(value);
			},

			get disabled() {
				return disabled();
			},

			get activated() {
				return activated();
			},

			set activated(value) {
				activated(value);
			}
		};

		SMUIListItemMount && SMUIListItemMount(accessor);

		return () => {
			SMUIListItemUnmount && SMUIListItemUnmount(accessor);

			if ($.get(addTabindexIfNoItemsSelectedRaf)) {
				window.cancelAnimationFrame($.get(addTabindexIfNoItemsSelectedRaf));
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
			tabindexProp(0);
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
		if (!disabled()) {
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

	var $$exports = { action, getPrimaryText, getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [
			...nonInteractive()
				? []
				: [
					[
						Ripple,
						{
							ripple: !$.get(input),
							unbounded: false,
							color: (activated() || selected()) && $$props.color == null ? 'primary' : $$props.color,
							disabled: disabled(),
							addClass,
							removeClass,
							addStyle
						}
					]
				],
			...use()
		]);

		let $1 = $.derived(() => classMap({
			'mdc-deprecated-list-item': !wrapper(),
			'mdc-deprecated-list-item__wrapper': wrapper(),
			'mdc-deprecated-list-item--activated': activated(),
			'mdc-deprecated-list-item--selected': selected(),
			'mdc-deprecated-list-item--disabled': disabled(),
			'mdc-menu-item--selected': !nav && role() === 'menuitem' && selected(),
			'smui-menu-item--non-interactive': nonInteractive(),
			...internalClasses,
			[className()]: true
		}));

		let $2 = $.derived(() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '));
		let $3 = $.derived(() => skipRestoreFocus() || undefined);

		$.component(node, MyComponent, ($$anchor, MyComponent_1) => {
			$.bind_this(
				MyComponent_1($$anchor, $.spread_props(
					{
						get tag() {
							return tag();
						},

						get use() {
							return $.get($0);
						},

						get class() {
							return $.get($1);
						},

						get style() {
							return $.get($2);
						}
					},
					() => nav && activated() ? { 'aria-current': 'page' } : {},
					() => !nav || wrapper() ? { role: role() } : {},
					() => !nav && role() === 'option'
						? { 'aria-selected': selected() ? 'true' : 'false' }
						: {},
					() => !nav && (role() === 'radio' || role() === 'checkbox')
						? {
							'aria-checked': $.get(input) && $.get(input).checked ? 'true' : 'false'
						}
						: {},
					() => !nav
						? { 'aria-disabled': disabled() ? 'true' : 'false' }
						: {},
					{
						get 'data-menu-item-skip-restore-focus'() {
							return $.get($3);
						},

						get tabindex() {
							return $.get(tabindex);
						},

						get href() {
							return $$props.href;
						}
					},
					() => internalAttrs,
					() => restProps,
					{
						onclick: (e) => {
							action(e);
							$$props.onclick?.(e);
						},

						onkeydown: (e) => {
							handleKeydown(e);
							$$props.onkeydown?.(e);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_1 = $.first_child(fragment_1);

							{
								var consequent = ($$anchor) => {
									var span = root();

									$.append($$anchor, span);
								};

								$.if(node_1, ($$render) => {
									if (ripple()) $$render(consequent);
								});
							}

							var node_2 = $.sibling(node_1);

							$.snippet(node_2, () => $$props.children ?? $.noop);
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