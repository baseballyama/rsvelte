import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { on } from 'svelte/events';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Textfield from '@smui/textfield';
import Menu from '@smui/menu';
import List, { Item, Text } from '@smui/list';
import { Anchor } from '@smui/menu-surface';

let counter = 0;

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'options',
	'value',
	'getOptionDisabled',
	'getOptionLabel',
	'text',
	'label',
	'disabled',
	'toggle',
	'combobox',
	'clearOnBlur',
	'selectOnExactMatch',
	'showMenuWithNoInput',
	'noMatchesActionDisabled',
	'search',
	'menu$class',
	'menu$anchor',
	'menu$anchorCorner',
	'children',
	'loading',
	'error',
	'match',
	'noMatches'
]);

var root = $.from_html(`<div><div role="combobox" tabindex="0"><!></div> <!></div>`);

export default function Autocomplete($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The styling variant of the input.
	 */
	/**
	 * The available options, or a function that returns them asynchronously.
	 */
	/**
	 * The value of the input.
	 */
	/**
	 * A function that returns whether an option is disabled.
	 */
	/**
	 * A function that returns the text label for an object.
	 */
	/**
	 * The text value of the input box.
	 */
	/**
	 * The label or a spot for the label.
	 */
	/**
	 * Whether the input is disabled.
	 */
	/**
	 * Whether options should be toggled when selected.
	 */
	/**
	 * Allow the user to enter their own value as well as pick from the options.
	 */
	/**
	 * Clear the input text when the input loses focus.
	 */
	/**
	 * Select an option when the search text matches it exactly.
	 */
	/**
	 * Show the options dropdown menu before the user enters any input text.
	 */
	/**
	 * Whether the item button displayed when there are no matches is disabled.
	 */
	/**
	 * A function that takes a search input and returns options.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Anchor the menu surface automatically to its parent element.
	 *
	 * If you set this to false, you need to provide an element to
	 * `anchorElement`.
	 */
	/**
	 * Default anchor corner alignment of top left menu surface corner.
	 */
	/**
	 * A spot for the item text when the results are loading.
	 */
	/**
	 * A spot for the item text when an error occurred.
	 */
	/**
	 * A spot for the item text for a matched option.
	 */
	/**
	 * A spot for the item text when no matches were found.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		options = $.prop($$props, 'options', 19, () => []),
		value = $.prop($$props, 'value', 15),
		getOptionDisabled = $.prop($$props, 'getOptionDisabled', 3, () => false),
		getOptionLabel = $.prop($$props, 'getOptionLabel', 3, (option) => option == null ? '' : `${option}`),
		text = $.prop($$props, 'text', 31, () => $.proxy(getOptionLabel()(value()))),
		disabled = $.prop($$props, 'disabled', 3, false),
		toggle = $.prop($$props, 'toggle', 3, false),
		combobox = $.prop($$props, 'combobox', 3, false),
		clearOnBlur = $.prop($$props, 'clearOnBlur', 19, () => !combobox()),
		selectOnExactMatch = $.prop($$props, 'selectOnExactMatch', 3, true),
		showMenuWithNoInput = $.prop($$props, 'showMenuWithNoInput', 3, true),
		noMatchesActionDisabled = $.prop($$props, 'noMatchesActionDisabled', 3, true),
		search = $.prop($$props, 'search', 3, async (input) => {
			const linput = input.toLowerCase();
			const fullOptions = typeof options() == 'function' ? await options()() : options() || [];

			if (linput === '') {
				return fullOptions;
			}

			const result = fullOptions.filter((item) => getOptionLabel()(item).toLowerCase().includes(linput));

			result.sort((a, b) => {
				const aString = getOptionLabel()(a).toLowerCase();
				const bString = getOptionLabel()(b).toLowerCase();

				if (aString.startsWith(linput) && !bString.startsWith(linput)) {
					return -1;
				} else if (bString.startsWith(linput) && !aString.startsWith(linput)) {
					return 1;
				}

				return 0;
			});

			return result;
		}),
		menu$class = $.prop($$props, 'menu$class', 3, ''),
		menu$anchor = $.prop($$props, 'menu$anchor', 3, false),
		menu$anchorCorner = $.prop($$props, 'menu$anchorCorner', 3, 'BOTTOM_START'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let inputContainer;
	let loadingState = $.state(0);
	let errorState = $.state(false);
	let focused = $.state(false);
	let listAccessor;
	let matches = $.state($.proxy([]));
	let focusedIndex = $.state(-1);
	let focusedItem = $.state(void 0);
	let menuId = restProps['menu$id'] ?? 'SMUI-autocomplete-' + counter++ + '-menu';
	const menuOpen = $.derived(() => $.get(focused) && (text() !== '' || showMenuWithNoInput()) && ($.get(loadingState) > 0 || !combobox() && !($.get(matches).length === 1 && $.get(matches)[0] === value()) || combobox() && !!$.get(matches).length && !($.get(matches).length === 1 && $.get(matches)[0] === value())));
	let previousText = text();

	$.user_effect(() => {
		if (previousText !== text()) {
			if (value() != null && getOptionLabel()(value()) !== text() && !combobox()) {
				deselectOption(value(), false);
			}

			// Only when we're focused do we need to perform a search.
			if ($.get(focused)) {
				performSearch();
				previousText = text();
			}
		}
	});

	let performingSearchForOptions = false;

	$.user_effect(() => {
		if (options() && !performingSearchForOptions) {
			performingSearchForOptions = true;

			// Set search results on init and refresh search results when `options` is
			// changed.
			performSearch().then(() => {
				performingSearchForOptions = false;
			});
		}
	});

	let previousValue = value();

	$.user_effect(() => {
		if (previousValue !== value()) {
			// If the value changed from outside, update the text.
			text(getOptionLabel()(value()));

			previousValue = value();
		} else if (combobox() && value() !== text()) {
			// An update came from the user.
			value(text());

			previousValue = value();
		}
	});

	let previousFocusedIndex = undefined;

	$.user_effect(() => {
		if (previousFocusedIndex !== $.get(focusedIndex)) {
			const activeItems = getActiveMenuItems();

			if ($.get(focusedIndex) === -1) {
				$.set(focusedItem, undefined);
			} else {
				$.set(focusedItem, activeItems[$.get(focusedIndex)], true);

				if ($.get(focusedItem)) {
					$.get(focusedItem).activated = true;

					if (!isInViewport($.get(focusedItem).element)) {
						$.get(focusedItem).element.scrollIntoView({ block: 'end', inline: 'nearest' });
					}
				}
			}

			activeItems.forEach((item, i) => {
				if (i !== $.get(focusedIndex)) {
					item.activated = false;
				}
			});

			if (listAccessor) {
				listAccessor.getOrderedList().forEach((itemAccessor) => {
					itemAccessor.tabindex = -1;
				});
			}

			previousFocusedIndex = $.get(focusedIndex);
		}
	});

	setContext('SMUI:list:mount', (accessor) => {
		if (!listAccessor) {
			listAccessor = accessor;
		}
	});

	async function performSearch() {
		// This will cause the menu to be rerendered, so we should preserve
		// focus if the menu is focused.
		if ($.get(focused) && !isInputFocused()) {
			focus();
		}

		$.set(loadingState, $.get(loadingState) + 1);
		$.set(errorState, false);

		try {
			const searchResult = await search()(text());

			if (searchResult !== false) {
				$.set(matches, searchResult, true);

				if (selectOnExactMatch()) {
					const exactMatch = $.get(matches).find((match) => getOptionLabel()(match) === text());

					if (exactMatch != null && getOptionLabel()(value()) !== text()) {
						selectOption(exactMatch);
					}
				}
			}
		} catch(e) {
			$.set(errorState, true);
		}

		$.set(loadingState, $.get(loadingState) - 1);
	}

	function selectOption(option, setText = true) {
		const event = dispatch(getElement(), 'SMUIAutocompleteSelected', option, { bubbles: true, cancelable: true });

		if (event.defaultPrevented) {
			return;
		}

		if (setText) {
			text(getOptionLabel()(option));
		}

		value(option);

		if (!setText) {
			previousValue = option;
		}
	}

	function deselectOption(option, setText = true) {
		const event = dispatch(getElement(), 'SMUIAutocompleteDeselected', option, { bubbles: true, cancelable: true });

		if (event.defaultPrevented) {
			return;
		}

		if (setText) {
			text('');
		}

		value(undefined);

		if (!setText) {
			previousValue = undefined;
		}
	}

	function toggleOption(option) {
		if (option === value()) {
			deselectOption(option);
		} else {
			selectOption(option);
		}
	}

	function isInViewport(elem) {
		var bounding = elem.getBoundingClientRect();

		return bounding.top >= 0 && bounding.left >= 0 && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) && bounding.right <= (window.innerWidth || document.documentElement.clientWidth);
	}

	function getActiveMenuItems() {
		if (!listAccessor) {
			return [];
		}

		return listAccessor.getOrderedList().filter((itemAccessor) => !itemAccessor.disabled);
	}

	function handleTextfieldKeydown(e) {
		if (combobox() && !$.get(matches).length) {
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();

			if ($.get(focusedIndex) === -1 || $.get(focusedIndex) === getActiveMenuItems().length - 1) {
				$.set(focusedIndex, 0);
			} else {
				$.update(focusedIndex);
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();

			if ($.get(focusedIndex) === -1 || $.get(focusedIndex) === 0) {
				$.set(focusedIndex, getActiveMenuItems().length - 1);
			} else {
				$.update(focusedIndex, -1);
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();

			const activeItems = getActiveMenuItems();

			if ($.get(focusedItem)) {
				if (activeItems[$.get(focusedIndex)]) {
					activeItems[$.get(focusedIndex)].action(e);
				}

				$.set(focusedIndex, -1);
			}
		}
	}

	async function handleElementBlur(event) {
		if (!document.hasFocus()) {
			// Document lost focus.
			on(
				window,
				'focus',
				() => {
					if (!getElement()?.contains(document.activeElement)) {
						handleElementBlur(event);
					}
				},
				{ once: true }
			);

			return;
		}

		if (event.currentTarget?.contains(event.relatedTarget)) {
			// Focus is remaining in the container.
			return;
		}

		// Clear the focus and input.
		$.set(focusedIndex, -1);

		$.set(focused, false);

		if (clearOnBlur() && value() == null) {
			text('');
		}
	}

	function isInputFocused() {
		if (inputContainer) {
			return document.activeElement === inputContainer.querySelector('input.mdc-text-field__input');
		}
	}

	function focus() {
		if (inputContainer) {
			const inputEl = inputContainer.querySelector('input.mdc-text-field__input');

			if (inputEl) {
				inputEl.focus();
			}
		}
	}

	function blur() {
		if (inputContainer) {
			const inputEl = inputContainer.querySelector('input.mdc-text-field__input');

			if (inputEl) {
				inputEl.blur();
			}
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { focus, blur, getElement };
	var div = root();

	var event_handler = (event) => {
		if (!disabled()) {
			handleElementBlur(event);
		}

		$$props.onfocusout?.(event);
	};

	$.attribute_effect(div, ($0, $1) => ({ class: $0, ...$1, onfocusout: event_handler }), [
		() => classMap({ 'smui-autocomplete': true, [className()]: true }),
		() => exclude(restProps, ['menu$', 'textfield$', 'list$'])
	]);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => prefixFilter(restProps, 'textfield$'));

				Textfield($$anchor, $.spread_props(
					{
						get label() {
							return $$props.label;
						},

						get disabled() {
							return disabled();
						}
					},
					() => $.get($0),
					{
						get value() {
							return text();
						},

						set value($$value) {
							text($$value);
						}
					}
				));
			}
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => inputContainer = $$value, () => inputContainer);

	var node_2 = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => classMap({ 'smui-autocomplete__menu': true, [menu$class()]: true }));
		let $1 = $.derived(() => prefixFilter(restProps, 'menu$'));

		Menu(node_2, $.spread_props(
			{
				get class() {
					return $.get($0);
				},

				get id() {
					return menuId;
				},
				managed: true,
				neverRestoreFocus: true,
				get open() {
					return $.get(menuOpen);
				},

				get anchor() {
					return menu$anchor();
				},

				get anchorCorner() {
					return menu$anchorCorner();
				}
			},
			() => $.get($1),
			{
				get anchorElement() {
					return element;
				},

				set anchorElement($$value) {
					element = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => prefixFilter(restProps, 'list$'));

						List($$anchor, $.spread_props(() => $.get($0), {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								{
									var consequent_2 = ($$anchor) => {
										Item($$anchor, {
											disabled: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_4 = $.first_child(fragment_5);

												{
													var consequent_1 = ($$anchor) => {
														var fragment_6 = $.comment();
														var node_5 = $.first_child(fragment_6);

														$.snippet(node_5, () => $$props.loading);
														$.append($$anchor, fragment_6);
													};

													var alternate_1 = ($$anchor) => {
														Text($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Loading...');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													};

													$.if(node_4, ($$render) => {
														if ($$props.loading) $$render(consequent_1); else $$render(alternate_1, -1);
													});
												}

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									};

									var consequent_4 = ($$anchor) => {
										Item($$anchor, {
											disabled: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_6 = $.first_child(fragment_9);

												{
													var consequent_3 = ($$anchor) => {
														var fragment_10 = $.comment();
														var node_7 = $.first_child(fragment_10);

														$.snippet(node_7, () => $$props.error);
														$.append($$anchor, fragment_10);
													};

													var alternate_2 = ($$anchor) => {
														Text($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Error while fetching suggestions.');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													};

													$.if(node_6, ($$render) => {
														if ($$props.error) $$render(consequent_3); else $$render(alternate_2, -1);
													});
												}

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									};

									var alternate_5 = ($$anchor) => {
										var fragment_12 = $.comment();
										var node_8 = $.first_child(fragment_12);

										$.each(
											node_8,
											17,
											() => $.get(matches),
											$.index,
											($$anchor, curMatch, i) => {
												{
													let $0 = $.derived(() => getOptionDisabled()($.get(curMatch)));
													let $1 = $.derived(() => $.get(curMatch) === value());

													Item($$anchor, {
														get disabled() {
															return $.get($0);
														},

														get selected() {
															return $.get($1);
														},

														onmouseenter: () => {
															$.set(focusedIndex, i, true);
														},

														onSMUIAction: () => toggle()
															? toggleOption($.get(curMatch))
															: selectOption($.get(curMatch)),

														children: ($$anchor, $$slotProps) => {
															var fragment_14 = $.comment();
															var node_9 = $.first_child(fragment_14);

															{
																var consequent_5 = ($$anchor) => {
																	var fragment_15 = $.comment();
																	var node_10 = $.first_child(fragment_15);

																	$.snippet(node_10, () => $$props.match, () => $.get(curMatch));
																	$.append($$anchor, fragment_15);
																};

																var alternate_3 = ($$anchor) => {
																	Text($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text();

																			$.template_effect(($0) => $.set_text(text_3, $0), [() => getOptionLabel()($.get(curMatch))]);
																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																};

																$.if(node_9, ($$render) => {
																	if ($$props.match) $$render(consequent_5); else $$render(alternate_3, -1);
																});
															}

															$.append($$anchor, fragment_14);
														},
														$$slots: { default: true }
													});
												}
											},
											($$anchor) => {
												Item($$anchor, {
													get disabled() {
														return noMatchesActionDisabled();
													},
													onSMUIAction: (e) => dispatch(getElement(), 'SMUIAutocompleteNoMatchesAction', e),
													children: ($$anchor, $$slotProps) => {
														var fragment_19 = $.comment();
														var node_11 = $.first_child(fragment_19);

														{
															var consequent_6 = ($$anchor) => {
																var fragment_20 = $.comment();
																var node_12 = $.first_child(fragment_20);

																$.snippet(node_12, () => $$props.noMatches);
																$.append($$anchor, fragment_20);
															};

															var alternate_4 = ($$anchor) => {
																Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('No matches found.');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															};

															$.if(node_11, ($$render) => {
																if ($$props.noMatches) $$render(consequent_6); else $$render(alternate_4, -1);
															});
														}

														$.append($$anchor, fragment_19);
													},
													$$slots: { default: true }
												});
											}
										);

										$.append($$anchor, fragment_12);
									};

									$.if(node_3, ($$render) => {
										if ($.get(loadingState)) $$render(consequent_2); else if ($.get(errorState)) $$render(consequent_4, 1); else $$render(alternate_5, -1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					}
				},
				$$slots: { default: true }
			}
		));
	}

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node) => Anchor?.($$node));
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	$.template_effect(() => {
		$.set_attribute(div_1, 'aria-controls', menuId);
		$.set_attribute(div_1, 'aria-expanded', $.get(menuOpen) ? 'true' : 'false');
	});

	$.delegated('focusin', div_1, () => {
		if (!disabled()) {
			$.set(focused, true);
		}
	});

	$.delegated('input', div_1, () => {
		$.set(focusedIndex, -1);
	});

	$.event('keydown', div_1, handleTextfieldKeydown, true);
	$.append($$anchor, div);

	return $.pop($$exports);
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The styling variant of the input.
	 */
	/**
	 * The available options, or a function that returns them asynchronously.
	 */
	/**
	 * The value of the input.
	 */
	/**
	 * A function that returns whether an option is disabled.
	 */
	/**
	 * A function that returns the text label for an object.
	 */
	/**
	 * The text value of the input box.
	 */
	/**
	 * The label or a spot for the label.
	 */
	/**
	 * Whether the input is disabled.
	 */
	/**
	 * Whether options should be toggled when selected.
	 */
	/**
	 * Allow the user to enter their own value as well as pick from the options.
	 */
	/**
	 * Clear the input text when the input loses focus.
	 */
	/**
	 * Select an option when the search text matches it exactly.
	 */
	/**
	 * Show the options dropdown menu before the user enters any input text.
	 */
	/**
	 * Whether the item button displayed when there are no matches is disabled.
	 */
	/**
	 * A function that takes a search input and returns options.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Anchor the menu surface automatically to its parent element.
	 *
	 * If you set this to false, you need to provide an element to
	 * `anchorElement`.
	 */
	/**
	 * Default anchor corner alignment of top left menu surface corner.
	 */
	/**
	 * A spot for the item text when the results are loading.
	 */
	/**
	 * A spot for the item text when an error occurred.
	 */
	/**
	 * A spot for the item text for a matched option.
	 */
	/**
	 * A spot for the item text when no matches were found.
	 */
	// Only when we're focused do we need to perform a search.
	// Set search results on init and refresh search results when `options` is
	// changed.
	// If the value changed from outside, update the text.
	// An update came from the user.
	// This will cause the menu to be rerendered, so we should preserve
	// focus if the menu is focused.
	// Document lost focus.
	// Focus is remaining in the container.
	// Clear the focus and input.
}

$.delegate(['focusin', 'input']);