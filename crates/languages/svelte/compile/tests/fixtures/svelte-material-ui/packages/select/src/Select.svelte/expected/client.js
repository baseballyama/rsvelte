import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'ripple',
	'disabled',
	'variant',
	'noLabel',
	'label',
	'value',
	'key',
	'dirty',
	'invalid',
	'updateInvalid',
	'required',
	'inputId',
	'hiddenInput',
	'withLeadingIcon',
	'anchor$use',
	'anchor$class',
	'selectedTextContainer$use',
	'selectedTextContainer$class',
	'selectedText$use',
	'selectedText$class',
	'dropdownIcon$use',
	'dropdownIcon$class',
	'menu$class',
	'children',
	'leadingIcon',
	'helperText'
]);

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<span class="mdc-select__ripple"></span>`);
var root_2 = $.from_html(`<div><!> <div><!> <!> <!> <!> <span><span> </span></span> <span><svg class="mdc-select__dropdown-icon-graphic" viewBox="7 10 10 5" focusable="false"><polygon class="mdc-select__dropdown-icon-inactive" stroke="none" fill-rule="evenodd" points="7 10 12 15 17 10"></polygon><polygon class="mdc-select__dropdown-icon-active" stroke="none" fill-rule="evenodd" points="7 15 12 10 17 15"></polygon></svg></span> <!></div> <!></div> <!>`, 1);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	const $valueStore = () => $.store_get(valueStore, '$valueStore', $$stores);
	const $selectedTextStore = () => $.store_get(selectedTextStore, '$selectedTextStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		disabled = $.prop($$props, 'disabled', 3, false),
		variant = $.prop($$props, 'variant', 3, 'standard'),
		noLabel = $.prop($$props, 'noLabel', 3, false),
		label = $.prop($$props, 'label', 3, undefined),
		value = $.prop($$props, 'value', 15),
		key = $.prop($$props, 'key', 3, (item) => item),
		dirty = $.prop($$props, 'dirty', 15, false),
		invalid = $.prop($$props, 'invalid', 15, uninitializedValue),
		updateInvalid = $.prop($$props, 'updateInvalid', 19, () => isUninitializedValue(invalid())),
		required = $.prop($$props, 'required', 3, false),
		inputId = $.prop($$props, 'inputId', 19, () => 'SMUI-select-' + counter++),
		hiddenInput = $.prop($$props, 'hiddenInput', 3, false),
		withLeadingIcon = $.prop($$props, 'withLeadingIcon', 3, uninitializedValue),
		anchor$use = $.prop($$props, 'anchor$use', 19, () => []),
		anchor$class = $.prop($$props, 'anchor$class', 3, ''),
		selectedTextContainer$use = $.prop($$props, 'selectedTextContainer$use', 19, () => []),
		selectedTextContainer$class = $.prop($$props, 'selectedTextContainer$class', 3, ''),
		selectedText$use = $.prop($$props, 'selectedText$use', 19, () => []),
		selectedText$class = $.prop($$props, 'selectedText$class', 3, ''),
		dropdownIcon$use = $.prop($$props, 'dropdownIcon$use', 19, () => []),
		dropdownIcon$class = $.prop($$props, 'dropdownIcon$class', 3, ''),
		menu$class = $.prop($$props, 'menu$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	// Some trickery to detect uninitialized values but also have the right types.
	const useDefaultValidation = isUninitializedValue(invalid());

	if (isUninitializedValue(invalid())) {
		invalid(false);
	}

	// Done with the trickery.
	let element;

	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let selectAnchor;
	let selectAnchorAttrs = $.proxy({});
	let selectedIndex = $.state(-1);
	const menuId = $.derived(() => restProps['menu$id'] ?? inputId() + '-menu');
	let helperId = $.state(void 0);
	let addLayoutListener = getContext('SMUI:addLayoutListener');
	let removeLayoutListener;
	let menuOpen = $.state(false);
	let menuClasses = $.proxy({});
	let anchorElement = $.state(void 0);
	let anchorCorner = $.state(void 0);
	let wrapFocus = $.state(false);
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

	const valueStore = writable(value());

	$.user_effect(() => {
		$.store_set(valueStore, value());
	});

	setContext('SMUI:select:value', valueStore);

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getValue() !== key()(value())) {
			$.get(instance).setValue(key()(value()));
		}
	});

	let previousSelectedIndex = $.get(selectedIndex);

	$.user_effect(() => {
		if (previousSelectedIndex !== $.get(selectedIndex)) {
			previousSelectedIndex = $.get(selectedIndex);

			if ($.get(instance)) {
				$.get(instance).setSelectedIndex($.get(selectedIndex), /* closeMenu */ false, /* skipNotify */ true);
			} else {
				const values = getMenuItemValues();

				if (value() !== values[$.get(selectedIndex)]) {
					value(values[$.get(selectedIndex)]);
				}
			}
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getDisabled() !== disabled()) {
			$.get(instance).setDisabled(disabled());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && dirty() && $.get(instance).isValid() !== !invalid()) {
			if (updateInvalid()) {
				invalid(!$.get(instance).isValid());
			} else {
				$.get(instance).setValid(!invalid());
			}
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getRequired() !== required()) {
			$.get(instance).setRequired(required());
		}
	});

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
		$.set(helperId, id, true);
	});

	setContext('SMUI:select:helper-text:mount', (accessor) => {
		helperTextInstance = accessor;
	});

	setContext('SMUI:select:helper-text:unmount', () => {
		$.set(helperId, undefined);
		helperTextInstance = undefined;
	});

	onMount(() => {
		$.set(
			instance,
			new MDCSelectFoundation(
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
						$.set(menuOpen, true);
					},

					closeMenu: () => {
						$.set(menuOpen, false);
					},
					getAnchorElement: () => selectAnchor,
					setMenuAnchorElement: (value) => {
						$.set(anchorElement, value, true);
					},

					setMenuAnchorCorner: (value) => {
						$.set(anchorCorner, value, true);
					},

					setMenuWrapFocus: (value) => {
						$.set(wrapFocus, value, true);
					},
					getSelectedIndex: () => $.get(selectedIndex),
					setSelectedIndex: (index) => {
						// Don't update the instance again.
						previousSelectedIndex = index;

						$.set(selectedIndex, index, true);
						value(getMenuItemValues()[$.get(selectedIndex)]);
					},

					focusMenuItemAtIndex: (index) => {
						list.focusItemAtIndex(index);
					},
					getMenuItemCount: () => list.items.length,
					getMenuItemValues: () => getMenuItemValues().map(key()),
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
						dirty(true);

						if (updateInvalid()) {
							invalid(!$.get(instance)?.isValid());
						}

						dispatch(getElement(), 'SMUISelectChange', { value: value(), index: $.get(selectedIndex) });
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
			),
			true
		);

		$.set(selectedIndex, getMenuItemValues().indexOf(value()), true);
		$.get(instance).init();
		setUseDefaultValidation(useDefaultValidation);

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
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
		if ($.get(instance) == null) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).getUseDefaultValidation();
	}

	/**
	 * This is set to true automatically if you don't provide a `invalid` prop.
	 */
	function setUseDefaultValidation(useDefaultValidation) {
		$.get(instance)?.setUseDefaultValidation(useDefaultValidation);
	}

	function focus() {
		selectAnchor.focus();
	}

	function layout() {
		$.get(instance)?.layout();
	}

	function getElement() {
		return element;
	}

	var $$exports = {
		getUseDefaultValidation,
		setUseDefaultValidation,
		focus,
		layout,
		getElement
	};

	var fragment = root_2();
	var div = $.first_child(fragment);

	$.attribute_effect(div, ($0, $1, $2) => ({ class: $0, style: $1, ...$2 }), [
		() => classMap({
			'mdc-select': true,
			'mdc-select--required': required(),
			'mdc-select--disabled': disabled(),
			'mdc-select--filled': variant() === 'filled',
			'mdc-select--outlined': variant() === 'outlined',
			'smui-select--standard': variant() === 'standard',
			'mdc-select--with-leading-icon': isUninitializedValue(withLeadingIcon()) ? $$props.leadingIcon : withLeadingIcon(),
			'mdc-select--no-label': noLabel() || label() == null,
			'mdc-select--invalid': invalid(),
			'mdc-select--activated': $.get(menuOpen),
			'mdc-data-table__pagination-rows-per-page-select': context === 'data-table:pagination',
			'mdc-data-table__pagination-rows-per-page-select--outlined': context === 'data-table:pagination' && variant() === 'outlined',
			...internalClasses,
			[className()]: true
		}),
		() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '),
		() => exclude(restProps, [
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
	]);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.attribute_effect(
				input,
				($0) => ({
					type: 'hidden',
					required: required(),
					disabled: disabled(),
					value: value(),
					...$0
				}),
				[() => prefixFilter(restProps, 'input$')],
				void 0,
				void 0,
				void 0,
				true
			);

			$.append($$anchor, input);
		};

		$.if(node, ($$render) => {
			if (hiddenInput()) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);

	var event_handler = (e) => {
		selectAnchor.focus();

		if ($.get(instance)) {
			$.get(instance).handleClick(getNormalizedXCoordinate(e));
		}

		$$props.anchor$onclick?.(e);
	};

	var event_handler_1 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleKeydown(e);
		}

		$$props.onkeydown?.(e);
	};

	var event_handler_2 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleBlur();
		}

		dispatch(getElement(), 'blur', e);
		$$props.anchor$onblur?.(e);
	};

	var event_handler_3 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleFocus();
		}

		dispatch(getElement(), 'focus', e);
		$$props.anchor$onfocus?.(e);
	};

	$.attribute_effect(
		div_1,
		($0, $1) => ({
			class: $0,
			'aria-required': required() ? 'true' : undefined,
			'aria-disabled': disabled() ? 'true' : undefined,
			'aria-controls': $.get(menuId),
			'aria-expanded': $.get(menuOpen) ? 'true' : 'false',
			'aria-describedby': $.get(helperId),
			'aria-labelledby': inputId() + '-smui-label',
			role: 'combobox',
			tabindex: '0',
			...selectAnchorAttrs,
			...$1,
			onclick: event_handler,
			onkeydown: event_handler_1,
			onblur: event_handler_2,
			onfocus: event_handler_3
		}),
		[
			() => classMap({ 'mdc-select__anchor': true, [anchor$class()]: true }),
			() => prefixFilter(restProps, 'anchor$')
		]
	);

	var node_1 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var span = root_1();

			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if (variant() === 'filled') $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			{
				let $0 = $.derived(() => inputId() + '-smui-label');
				let $1 = $.derived(() => $selectedTextStore() !== '');
				let $2 = $.derived(() => prefixFilter(restProps, 'label$'));

				$.bind_this(
					FloatingLabel($$anchor, $.spread_props(
						{
							get id() {
								return $.get($0);
							},

							get floatAbove() {
								return $.get($1);
							},

							get required() {
								return required();
							}
						},
						() => $.get($2),
						{
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								{
									var consequent_2 = ($$anchor) => {};

									var consequent_3 = ($$anchor) => {
										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, label()));
										$.append($$anchor, text_1);
									};

									var alternate = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.snippet(node_4, label);
										$.append($$anchor, fragment_4);
									};

									$.if(node_3, ($$render) => {
										if (label() == null) $$render(consequent_2); else if (typeof label() === 'string') $$render(consequent_3, 1); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}
					)),
					($$value) => floatingLabel = $$value,
					() => floatingLabel
				);
			}
		};

		$.if(node_2, ($$render) => {
			if (variant() !== 'outlined' && !noLabel() && label() != null) $$render(consequent_4);
		});
	}

	var node_5 = $.sibling(node_2, 2);

	{
		var consequent_8 = ($$anchor) => {
			{
				let $0 = $.derived(() => noLabel() || label() == null);
				let $1 = $.derived(() => prefixFilter(restProps, 'outline$'));

				$.bind_this(
					NotchedOutline($$anchor, $.spread_props(
						{
							get noLabel() {
								return $.get($0);
							}
						},
						() => $.get($1),
						{
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								{
									var consequent_7 = ($$anchor) => {
										{
											let $0 = $.derived(() => inputId() + '-smui-label');
											let $1 = $.derived(() => $selectedTextStore() !== '');
											let $2 = $.derived(() => prefixFilter(restProps, 'label$'));

											$.bind_this(
												FloatingLabel($$anchor, $.spread_props(
													{
														get id() {
															return $.get($0);
														},

														get floatAbove() {
															return $.get($1);
														},

														get required() {
															return required();
														}
													},
													() => $.get($2),
													{
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = $.comment();
															var node_7 = $.first_child(fragment_8);

															{
																var consequent_5 = ($$anchor) => {};

																var consequent_6 = ($$anchor) => {
																	var text_2 = $.text();

																	$.template_effect(() => $.set_text(text_2, label()));
																	$.append($$anchor, text_2);
																};

																var alternate_1 = ($$anchor) => {
																	var fragment_10 = $.comment();
																	var node_8 = $.first_child(fragment_10);

																	$.snippet(node_8, label);
																	$.append($$anchor, fragment_10);
																};

																$.if(node_7, ($$render) => {
																	if (label() == null) $$render(consequent_5); else if (typeof label() === 'string') $$render(consequent_6, 1); else $$render(alternate_1, -1);
																});
															}

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													}
												)),
												($$value) => floatingLabel = $$value,
												() => floatingLabel
											);
										}
									};

									$.if(node_6, ($$render) => {
										if (!noLabel() && label() != null) $$render(consequent_7);
									});
								}

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						}
					)),
					($$value) => notchedOutline = $$value,
					() => notchedOutline
				);
			}
		};

		$.if(node_5, ($$render) => {
			if (variant() === 'outlined') $$render(consequent_8);
		});
	}

	var node_9 = $.sibling(node_5, 2);

	$.snippet(node_9, () => $$props.leadingIcon ?? $.noop);

	var span_1 = $.sibling(node_9, 2);

	$.attribute_effect(span_1, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-select__selected-text-container': true,
			[selectedTextContainer$class()]: true
		}),
		() => prefixFilter(restProps, 'selectedTextContainer$')
	]);

	var span_2 = $.child(span_1);

	$.attribute_effect(
		span_2,
		($0, $1) => ({
			id: inputId() + '-smui-selected-text',
			class: $0,
			role: 'button',
			'aria-haspopup': 'listbox',
			'aria-labelledby': inputId() + '-smui-label',
			...$1
		}),
		[
			() => classMap({
				'mdc-select__selected-text': true,
				[selectedText$class()]: true
			}),
			() => prefixFilter(restProps, 'selectedText$')
		]
	);

	var text_3 = $.only_child(span_2, true);

	$.action(span_2, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), selectedText$use);
	$.reset(span_1);
	$.action(span_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), selectedTextContainer$use);

	var span_3 = $.sibling(span_1, 2);

	$.attribute_effect(span_3, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-select__dropdown-icon': true,
			[dropdownIcon$class()]: true
		}),
		() => prefixFilter(restProps, 'dropdownIcon$')
	]);

	$.action(span_3, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), dropdownIcon$use);

	var node_10 = $.sibling(span_3, 2);

	{
		var consequent_9 = ($$anchor) => {
			{
				let $0 = $.derived(() => prefixFilter(restProps, 'ripple$'));

				$.bind_this(LineRipple($$anchor, $.spread_props(() => $.get($0))), ($$value) => lineRipple = $$value, () => lineRipple);
			}
		};

		$.if(node_10, ($$render) => {
			if (variant() !== 'outlined' && ripple()) $$render(consequent_9);
		});
	}

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => selectAnchor = $$value, () => selectAnchor);
	$.action(div_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), anchor$use);

	var node_11 = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => classMap({
			'mdc-select__menu': true,
			...menuClasses,
			[menu$class()]: true
		}));

		let $1 = $.derived(() => prefixFilter(restProps, 'menu$'));

		Menu(node_11, $.spread_props(
			{
				get class() {
					return $.get($0);
				},

				get id() {
					return $.get(menuId);
				},
				fullWidth: true,
				anchor: false,
				get anchorElement() {
					return $.get(anchorElement);
				},

				get anchorCorner() {
					return $.get(anchorCorner);
				}
			},
			() => $.get($1),
			{
				onSMUIMenuSelected: (e) => {
					if ($.get(instance)) {
						$.get(instance).handleMenuItemAction(e.detail.index);
					}

					$$props.onSMUIMenuSelected?.(e);
				},

				onSMUIMenuSurfaceClosing: (e) => {
					if ($.get(instance)) {
						$.get(instance).handleMenuClosing();
					}

					$$props.onSMUIMenuSurfaceClosing?.(e);
				},

				onSMUIMenuSurfaceClosed: (e) => {
					if ($.get(instance)) {
						$.get(instance).handleMenuClosed();
					}

					$$props.onSMUIMenuSurfaceClosed?.(e);
				},

				onSMUIMenuSurfaceOpened: (e) => {
					if ($.get(instance)) {
						$.get(instance).handleMenuOpened();
					}

					$$props.onSMUIMenuSurfaceOpened?.(e);
				},

				get open() {
					return $.get(menuOpen);
				},

				set open($$value) {
					$.set(menuOpen, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => prefixFilter(restProps, 'list$'));

						List($$anchor, $.spread_props(
							{
								role: 'listbox',
								get wrapFocus() {
									return $.get(wrapFocus);
								}
							},
							() => $.get($0),
							{
								get selectedIndex() {
									return $.get(selectedIndex);
								},

								set selectedIndex($$value) {
									$.set(selectedIndex, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_13 = $.comment();
									var node_12 = $.first_child(fragment_13);

									$.snippet(node_12, () => $$props.children ?? $.noop);
									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							}
						));
					}
				},
				$$slots: { default: true }
			}
		));
	}

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		ripple: variant() === 'filled',
		unbounded: false,
		addClass,
		removeClass,
		addStyle
	}));

	$.action(div, ($$node, $$action_arg) => Anchor?.($$node, $$action_arg), () => ({ addClass, removeClass }));
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	var node_13 = $.sibling(div, 2);

	{
		var consequent_10 = ($$anchor) => {
			{
				let $0 = $.derived(() => prefixFilter(restProps, 'helperText$'));

				HelperText($$anchor, $.spread_props(() => $.get($0), {
					children: ($$anchor, $$slotProps) => {
						var fragment_15 = $.comment();
						var node_14 = $.first_child(fragment_15);

						$.snippet(node_14, () => $$props.helperText ?? $.noop);
						$.append($$anchor, fragment_15);
					},
					$$slots: { default: true }
				}));
			}
		};

		$.if(node_13, ($$render) => {
			if ($$props.helperText) $$render(consequent_10);
		});
	}

	$.template_effect(() => $.set_text(text_3, $selectedTextStore()));
	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}