import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext, getContext } from 'svelte';
import { writable } from 'svelte/store';
import { classMap, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';
import { deprecated } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'chip',
	'ripple',
	'touch',
	'shouldRemoveOnTrailingIconClick',
	'shouldFocusPrimaryActionOnClick',
	'component',
	'tag',
	'children'
]);

var root = $.from_html(`<div class="mdc-chip__ripple"></div>`);
var root_1 = $.from_html(`<div class="mdc-chip__touch"></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chip($$anchor, $$props) {
	$.push($$props, true);

	const $initialSelectedStore = () => $.store_get(initialSelectedStore, '$initialSelectedStore', $$stores);
	const $shouldRemoveOnTrailingIconClickStore = () => $.store_get(shouldRemoveOnTrailingIconClickStore, '$shouldRemoveOnTrailingIconClickStore', $$stores);
	const $isSelectedStore = () => $.store_get(isSelectedStore, '$isSelectedStore', $$stores);
	const $leadingIconClassesStore = () => $.store_get(leadingIconClassesStore, '$leadingIconClassesStore', $$stores);
	const $choice = () => $.store_get(choice, '$choice', $$stores);
	const $index = () => $.store_get(index, '$index', $$stores);
	const $nonInteractive = () => $.store_get(nonInteractive, '$nonInteractive', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		touch = $.prop($$props, 'touch', 3, false),
		shouldRemoveOnTrailingIconClick = $.prop($$props, 'shouldRemoveOnTrailingIconClick', 3, true),
		shouldFocusPrimaryActionOnClick = $.prop($$props, 'shouldFocusPrimaryActionOnClick', 3, true),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, 'div'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let leadingIconClasses = $.proxy({});
	let internalStyles = $.proxy({});
	const initialSelectedStore = getContext('SMUI:chips:chip:initialSelected');
	let selected = $.state($.proxy($initialSelectedStore()));
	let primaryActionAccessor = undefined;
	let trailingActionAccessor = undefined;
	const nonInteractive = getContext('SMUI:chips:nonInteractive');
	const choice = getContext('SMUI:chips:choice');
	const index = getContext('SMUI:chips:chip:index');
	const shouldRemoveOnTrailingIconClickStore = writable(shouldRemoveOnTrailingIconClick());

	$.user_effect(() => {
		$.store_set(shouldRemoveOnTrailingIconClickStore, shouldRemoveOnTrailingIconClick());
	});

	setContext('SMUI:chips:chip:shouldRemoveOnTrailingIconClick', shouldRemoveOnTrailingIconClickStore);

	const isSelectedStore = writable($.get(selected));

	$.user_effect(() => {
		$.store_set(isSelectedStore, $.get(selected));
	});

	setContext('SMUI:chips:chip:isSelected', isSelectedStore);

	const leadingIconClassesStore = writable(leadingIconClasses);

	$.user_effect(() => {
		$.store_set(leadingIconClassesStore, leadingIconClasses);
	});

	setContext('SMUI:chips:chip:leadingIconClasses', leadingIconClassesStore);
	setContext('SMUI:chips:chip:focusable', $choice() && $.get(selected) || $index() === 0);

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getShouldRemoveOnTrailingIconClick() !== shouldRemoveOnTrailingIconClick()) {
			$.get(instance).setShouldRemoveOnTrailingIconClick(shouldRemoveOnTrailingIconClick());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setShouldFocusPrimaryActionOnClick(shouldFocusPrimaryActionOnClick());
		}
	});

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
		$.set(
			instance,
			new MDCChipFoundation({
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
				notifyInteraction: () => dispatch(getElement(), 'SMUIChipInteraction', { chipId: $$props.chip }),
				notifyNavigation: (key, source) => dispatch(getElement(), 'SMUIChipNavigation', { chipId: $$props.chip, key, source }),
				notifyRemoval: (removedAnnouncement) => dispatch(getElement(), 'SMUIChipRemoval', { chipId: $$props.chip, removedAnnouncement }),
				notifySelection: (selected, shouldIgnore) => dispatch(getElement(), 'SMUIChipSelection', { chipId: $$props.chip, selected, shouldIgnore }),
				notifyTrailingIconInteraction: () => dispatch(getElement(), 'SMUIChipTrailingIconInteraction', { chipId: $$props.chip }),
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
			}),
			true
		);

		const accessor = {
			chipId: $$props.chip,
			get selected() {
				return $.get(selected);
			},
			focusPrimaryAction,
			focusTrailingAction,
			removeFocus,
			setSelectedFromChipSet
		};

		SMUIChipsChipMount && SMUIChipsChipMount(accessor);
		$.get(instance).init();

		return () => {
			SMUIChipsChipUnmount && SMUIChipsChipUnmount(accessor);
			$.get(instance)?.destroy();
			$.set(instance, undefined);
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
		$.set(selected, value, true);
		$.get(instance)?.setSelectedFromChipSet($.get(selected), shouldNotifyClients);
	}

	function focusPrimaryAction() {
		$.get(instance)?.focusPrimaryAction();
	}

	function focusTrailingAction() {
		$.get(instance)?.focusTrailingAction();
	}

	function removeFocus() {
		$.get(instance)?.removeFocus();
	}

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [
			[
				Ripple,
				{
					ripple: ripple() && !$nonInteractive(),
					unbounded: false,
					addClass,
					removeClass,
					addStyle
				}
			],
			...use()
		]);

		let $1 = $.derived(() => classMap({
			'mdc-chip': true,
			'mdc-chip--selected': $.get(selected),
			'mdc-chip--touch': touch(),
			...internalClasses,
			[className()]: true
		}));

		let $2 = $.derived(() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '));

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
						},
						role: 'row'
					},
					() => restProps,
					{
						ontransitionend: (e) => {
							if ($.get(instance)) {
								$.get(instance).handleTransitionEnd(e);
							}

							$$props.ontransitionend?.(e);
						},

						onclick: (e) => {
							if ($.get(instance)) {
								$.get(instance).handleClick();
							}

							$$props.onclick?.(e);
						},

						onkeydown: (e) => {
							if ($.get(instance)) {
								$.get(instance).handleKeydown(e);
							}

							$$props.onkeydown?.(e);
						},

						onfocusin: (e) => {
							if ($.get(instance)) {
								$.get(instance).handleFocusIn(e);
							}

							$$props.onfocusin?.(e);
						},

						onfocusout: (e) => {
							if ($.get(instance)) {
								$.get(instance).handleFocusOut(e);
							}

							$$props.onfocusout?.(e);
						},

						onSMUIChipTrailingActionInteraction: (e) => {
							if ($.get(instance)) {
								$.get(instance).handleTrailingActionInteraction();
							}

							$$props.onSMUIChipTrailingActionInteraction?.(e);
						},

						onSMUIChipTrailingActionNavigation: (e) => {
							if ($.get(instance)) {
								$.get(instance).handleTrailingActionNavigation(e);
							}

							$$props.onSMUIChipTrailingActionNavigation?.(e);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var node_1 = $.first_child(fragment_1);

							{
								var consequent = ($$anchor) => {
									var div = root();

									$.append($$anchor, div);
								};

								$.if(node_1, ($$render) => {
									if (ripple() && !$nonInteractive()) $$render(consequent);
								});
							}

							var node_2 = $.sibling(node_1, 2);

							$.snippet(node_2, () => $$props.children ?? $.noop);

							var node_3 = $.sibling(node_2, 2);

							{
								var consequent_1 = ($$anchor) => {
									var div_1 = root_1();

									$.append($$anchor, div_1);
								};

								$.if(node_3, ($$render) => {
									if (touch()) $$render(consequent_1);
								});
							}

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

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}