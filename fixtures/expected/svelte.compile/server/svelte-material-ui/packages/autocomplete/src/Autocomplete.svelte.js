import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { on } from 'svelte/events';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Textfield from '@smui/textfield';
import Menu from '@smui/menu';
import List, { Item, Text } from '@smui/list';
import { Anchor } from '@smui/menu-surface';

let counter = 0;

export default function Autocomplete($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			use = [],
			class: className = '',
			options = [],
			value = void 0,
			getOptionDisabled = () => false,
			getOptionLabel = (option) => option == null ? '' : `${option}`,
			text = getOptionLabel(value),
			label,
			disabled = false,
			toggle = false,
			combobox = false,
			clearOnBlur = !combobox,
			selectOnExactMatch = true,
			showMenuWithNoInput = true,
			noMatchesActionDisabled = true,
			search = async (input) => {
				const linput = input.toLowerCase();
				const fullOptions = typeof options == 'function' ? await options() : options || [];

				if (linput === '') {
					return fullOptions;
				}

				const result = fullOptions.filter((item) => getOptionLabel(item).toLowerCase().includes(linput));

				result.sort((a, b) => {
					const aString = getOptionLabel(a).toLowerCase();
					const bString = getOptionLabel(b).toLowerCase();

					if (aString.startsWith(linput) && !bString.startsWith(linput)) {
						return -1;
					} else if (bString.startsWith(linput) && !aString.startsWith(linput)) {
						return 1;
					}

					return 0;
				});

				return result;
			},
			menu$class = '',
			menu$anchor = false,
			menu$anchorCorner = 'BOTTOM_START',
			children,
			loading,
			error,
			match,
			noMatches,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let inputContainer;
		let loadingState = 0;
		let errorState = false;
		let focused = false;
		let listAccessor;
		let matches = [];
		let focusedIndex = -1;
		let focusedItem = void 0;
		let menuId = restProps['menu$id'] ?? 'SMUI-autocomplete-' + counter++ + '-menu';
		const menuOpen = $.derived(() => focused && (text !== '' || showMenuWithNoInput) && (loadingState > 0 || !combobox && !(matches.length === 1 && matches[0] === value) || combobox && !!matches.length && !(matches.length === 1 && matches[0] === value)));
		let previousText = text;

		// Only when we're focused do we need to perform a search.
		let performingSearchForOptions = false;

		// Set search results on init and refresh search results when `options` is
		// changed.
		let previousValue = value;

		// If the value changed from outside, update the text.
		// An update came from the user.
		let previousFocusedIndex = undefined;

		setContext('SMUI:list:mount', (accessor) => {
			if (!listAccessor) {
				listAccessor = accessor;
			}
		});

		async function performSearch() {
			// This will cause the menu to be rerendered, so we should preserve
			// focus if the menu is focused.
			if (focused && !isInputFocused()) {
				focus();
			}

			loadingState += 1;
			errorState = false;

			try {
				const searchResult = await search(text);

				if (searchResult !== false) {
					matches = searchResult;

					if (selectOnExactMatch) {
						const exactMatch = matches.find((match) => getOptionLabel(match) === text);

						if (exactMatch != null && getOptionLabel(value) !== text) {
							selectOption(exactMatch);
						}
					}
				}
			} catch(e) {
				errorState = true;
			}

			loadingState -= 1;
		}

		function selectOption(option, setText = true) {
			const event = dispatch(getElement(), 'SMUIAutocompleteSelected', option, { bubbles: true, cancelable: true });

			if (event.defaultPrevented) {
				return;
			}

			if (setText) {
				text = getOptionLabel(option);
			}

			value = option;

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
				text = '';
			}

			value = undefined;

			if (!setText) {
				previousValue = undefined;
			}
		}

		function toggleOption(option) {
			if (option === value) {
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
			if (combobox && !matches.length) {
				return;
			}

			if (e.key === 'ArrowDown') {
				e.preventDefault();

				if (focusedIndex === -1 || focusedIndex === getActiveMenuItems().length - 1) {
					focusedIndex = 0;
				} else {
					focusedIndex++;
				}
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();

				if (focusedIndex === -1 || focusedIndex === 0) {
					focusedIndex = getActiveMenuItems().length - 1;
				} else {
					focusedIndex--;
				}
			} else if (e.key === 'Enter') {
				e.preventDefault();

				const activeItems = getActiveMenuItems();

				if (focusedItem) {
					if (activeItems[focusedIndex]) {
						activeItems[focusedIndex].action(e);
					}

					focusedIndex = -1;
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
			focusedIndex = -1;

			focused = false;

			if (clearOnBlur && value == null) {
				text = '';
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attributes({
				class: $.clsx(classMap({ 'smui-autocomplete': true, [className]: true })),
				...exclude(restProps, ['menu$', 'textfield$', 'list$'])
			})}><div${$.attr('aria-controls', menuId)}${$.attr('aria-expanded', menuOpen() ? 'true' : 'false')} role="combobox" tabindex="0">`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				Textfield($$renderer, $.spread_props([
					{ label, disabled },
					prefixFilter(restProps, 'textfield$'),
					{
						get value() {
							return text;
						},

						set value($$value) {
							text = $$value;
							$$settled = false;
						}
					}
				]));
			}

			$$renderer.push(`<!--]--></div> `);

			Menu($$renderer, $.spread_props([
				{
					class: classMap({ 'smui-autocomplete__menu': true, [menu$class]: true }),
					id: menuId,
					managed: true,
					neverRestoreFocus: true,
					open: menuOpen(),
					anchor: menu$anchor,
					anchorCorner: menu$anchorCorner
				},
				prefixFilter(restProps, 'menu$'),
				{
					get anchorElement() {
						return element;
					},

					set anchorElement($$value) {
						element = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						List($$renderer, $.spread_props([
							prefixFilter(restProps, 'list$'),
							{
								children: ($$renderer) => {
									if (loadingState) {
										$$renderer.push('<!--[0-->');

										Item($$renderer, {
											disabled: true,
											children: ($$renderer) => {
												if (loading) {
													$$renderer.push('<!--[0-->');
													loading($$renderer);
													$$renderer.push(`<!---->`);
												} else {
													$$renderer.push('<!--[-1-->');

													Text($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Loading...`);
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});
									} else if (errorState) {
										$$renderer.push('<!--[1-->');

										Item($$renderer, {
											disabled: true,
											children: ($$renderer) => {
												if (error) {
													$$renderer.push('<!--[0-->');
													error($$renderer);
													$$renderer.push(`<!---->`);
												} else {
													$$renderer.push('<!--[-1-->');

													Text($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Error while fetching suggestions.`);
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');

										const each_array = $.ensure_array_like(matches);

										if (each_array.length !== 0) {
											$$renderer.push('<!--[-->');

											for (let i = 0, $$length = each_array.length; i < $$length; i++) {
												let curMatch = each_array[i];

												Item($$renderer, {
													disabled: getOptionDisabled(curMatch),
													selected: curMatch === value,
													onmouseenter: () => {
														focusedIndex = i;
													},
													onSMUIAction: () => toggle ? toggleOption(curMatch) : selectOption(curMatch),
													children: ($$renderer) => {
														if (match) {
															$$renderer.push('<!--[0-->');
															match($$renderer, curMatch);
															$$renderer.push(`<!---->`);
														} else {
															$$renderer.push('<!--[-1-->');

															Text($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(getOptionLabel(curMatch))}`);
																},
																$$slots: { default: true }
															});
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});
											}
										} else {
											$$renderer.push('<!--[!-->');

											Item($$renderer, {
												disabled: noMatchesActionDisabled,
												onSMUIAction: (e) => dispatch(getElement(), 'SMUIAutocompleteNoMatchesAction', e),
												children: ($$renderer) => {
													if (noMatches) {
														$$renderer.push('<!--[0-->');
														noMatches($$renderer);
														$$renderer.push(`<!---->`);
													} else {
														$$renderer.push('<!--[-1-->');

														Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->No matches found.`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});
										}

										$$renderer.push(`<!--]-->`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							}
						]));
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value, text, focus, blur, getElement });
	});
}