import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconCheck, IconChevronDown, IconChevronUp, IconSearch, IconX } from '@tabler/icons-svelte';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
import { onMount, tick } from 'svelte';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';

var root = $.from_html(`<label class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"> </label>`);
var root_1 = $.from_html(`<label class="sr-only"> </label>`);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_html(`<button type="button" class="absolute inset-y-0 end-0 flex cursor-pointer items-center pe-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Clear search"><!></button>`);
var root_4 = $.from_html(`<div class="p-3"><div class="relative"><input type="search" class="focus:ring-opacity-50 dark:focus:ring-opacity-30 focus:ring-focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 ps-9 text-sm shadow-sm focus:border-blue-300 focus:ring focus:outline-none dark:border-gray-600 dark:bg-gray-600 dark:text-gray-200 dark:focus:border-blue-600 svelte-t5ihcw"/> <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3"><!></div> <!></div></div>`);
var root_5 = $.from_html(`<div class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400"> </div>`);
var root_6 = $.from_html(`<div class="px-4 py-2 text-center text-xs text-gray-400 dark:text-gray-500 pointer-events-none select-none" role="separator"> </div>`);
var root_7 = $.from_html(`<span class="absolute start-2 font-normal text-gray-900 dark:text-gray-200"><!></span>`);
var root_8 = $.from_html(`<button type="button" role="option" tabindex="0"><!> <span><!> <!></span></button>`);
var root_9 = $.from_html(`<div class="py-1" role="listbox" style="max-height: 250px;" tabindex="-1"><!></div>`);
var root_10 = $.from_html(`<div class="pointer-events-auto fixed z-popover overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700" style="min-width: 100px; width: auto; max-height: 300px;" role="dialog" aria-modal="true" tabindex="-1"><!> <div style="max-height: 250px;"><!></div></div>`);
var root_11 = $.from_html(`<!> <div><button type="button" role="combobox" aria-haspopup="listbox"><span><!> <!></span> <div class="relative h-4 w-4 flex-shrink-0"><!> <!></div></button> <!></div>`, 1);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	// Define the Option type
	// Optional gender field
	// Optional Tabler icon component
	// Optional tooltip text
	// Optional disabled state (for separators)
	let value = $.prop($$props, 'value', 15, ''),
		options = $.prop($$props, 'options', 27, () => $.proxy([])),
		placeholder = $.prop($$props, 'placeholder', 11, 'Select an option'),
		className = $.prop($$props, 'className', 11, ''),
		searchable = $.prop($$props, 'searchable', 11, false),
		onChange = $.prop($$props, 'onChange', 11, (_selectedValue) => {}),
		id = $.prop($$props, 'id', 11, ''),
		label = $.prop($$props, 'label', 11, ''),
		hideLabel = $.prop($$props, 'hideLabel', 11, false),
		height = $.prop($$props, 'height', 11, 'h-10');

	// Internal state
	let container = undefined; // Assigned via bind:this

	let dropdown = $.state(null);
	let fieldset = $.state(null);
	let search = $.state(null);
	let isOpen = $.state(false);
	let filter = $.state('');
	let uniqueId = $.state('');
	let overlayScrollbars = $.state(null);
	let closeTimeout = null;

	// Generate unique ID for aria attributes
	try {
		$.set(uniqueId, id() || crypto.randomUUID(), true);
	} catch(e) {
		console.error(e);
		$.set(uniqueId, crypto.getRandomValues(new Uint32Array(36)).toString(), true);
	}

	// Filtered options based on search filter
	let filteredOptions = $.derived(() => $.get(filter)
		? options().filter((option) => option.label.toLowerCase().includes($.get(filter).toLowerCase()))
		: options());

	// Current selected option
	let selectedOption = $.derived(() => options().find((option) => option.value === value()));

	let displayValue = $.derived(() => $.get(selectedOption) ? $.get(selectedOption).label : placeholder());
	let displayGender = $.derived(() => $.get(selectedOption)?.gender);

	let genderClass = $.derived(() => $.get(displayGender) === 'M'
		? 'text-blue-400/70 dark:text-blue-400/80'
		: $.get(displayGender) === 'F'
			? 'text-pink-400/70 dark:text-pink-400/80'
			: $.get(displayGender) === 'N' ? 'text-purple-400/70 dark:text-purple-400/80' : '');

	// Focus an element safely with type checking
	function focusElement(element) {
		if (element && typeof element.focus === 'function') {
			element.focus();
		}
	}

	// Position the dropdown relative to the container when portaled
	async function positionDropdown() {
		if (!$.get(dropdown) || !container) return;

		await tick(); // Wait for DOM to update

		const rect = container.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;

		// First set the width to ensure proper height calculation
		$.get(dropdown // minimum width of 120px
		).style.width = `${Math.max(rect.width, 120)}px`;

		// Get dropdown dimensions after setting width
		const dropdownHeight = $.get(dropdown).offsetHeight || 300;

		const dropdownWidth = $.get(dropdown).offsetWidth || rect.width;

		// Calculate space available below and above
		const spaceBelow = viewportHeight - rect.bottom;

		const spaceAbove = rect.top;

		// Use position above when there's not enough space below
		// or when there's more space above than below and the dropdown doesn't fit below
		const positionAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight || spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

		// Set fixed positioning
		$.get(dropdown).style.position = 'fixed';

		if (positionAbove) {
			// Position above with 5px gap
			$.get(dropdown).style.bottom = `${viewportHeight - rect.top + 5}px`;

			$.get(dropdown).style.top = 'auto';
		} else {
			// Position below with 5px gap
			$.get(dropdown).style.top = `${rect.bottom + 5}px`;

			$.get(dropdown).style.bottom = 'auto';
		}

		// Set horizontal position (default to start-aligned)
		$.get(dropdown).style.left = `${rect.left}px`;

		// Adjust if dropdown would go off-screen to the right
		if (rect.left + dropdownWidth > viewportWidth) {
			// Try to align with right edge of container
			const rightAligned = Math.max(0, rect.right - dropdownWidth);

			$.get(dropdown).style.left = `${rightAligned}px`;
		}
	}

	// Handle opening and closing the dropdown
	async function toggleDropdown(event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		$.set(isOpen, !$.get(isOpen));

		if ($.get(isOpen)) {
			// Wait for dropdown to be created and then position it
			await tick();

			positionDropdown();

			// Update parent scroll listeners when dropdown opens
			addParentScrollListeners();

			// Only auto-focus if opened with keyboard (arrow keys or Enter)
			if (event && event instanceof KeyboardEvent) {
				setTimeout(
					() => {
						if (event.key === 'ArrowUp') {
							// Focus last option for ArrowUp
							const options = $.get(fieldset)?.querySelectorAll('button[role="option"]');

							if (options && options.length > 0) {
								focusElement(options[options.length - 1]);
							}
						} else {
							// Focus first option for other keys
							const firstOption = $.get(fieldset)?.querySelector('button[role="option"]');

							if (firstOption) {
								focusElement(firstOption);
							} else if (searchable()) {
								// If no options or searchable, focus the search input
								focusElement($.get(search));
							}
						}
					},
					10
				);
			} else if (searchable()) {
				// Always focus search field if searchable (standard pattern)
				setTimeout(
					() => {
						focusElement($.get(search));
					},
					10
				);
			}

			// If opened with mouse, leave focus on button
		}
	}

	// Close dropdown when clicking outside
	function handleOutsideClick(event) {
		// Always check if the dropdown is open first
		if (!$.get(isOpen)) return;

		// Ignore clicks on the container (button) itself - these are handled by toggleDropdown
		if (container?.contains(event.target)) {
			return;
		}

		// Ignore clicks on the dropdown contents
		if ($.get(dropdown)?.contains(event.target)) {
			return;
		}

		// If we got here, it's a click outside both the button and dropdown, so close it
		closeDropdown();
	}

	function closeDropdown(options = {}) {
		$.set(isOpen, false);
		$.set(filter, '');

		// Only return focus if not prevented and if the select is still visible
		if (!options.preventFocus && isSelectVisible()) {
			setTimeout(
				() => {
					const button = container?.querySelector('button');

					if (button) {
						// Use focus with preventScroll to avoid unwanted scrolling
						button.focus({ preventScroll: true });
					}
				},
				0
			);
		}
	}

	// Handle option selection
	function handleSelect(option) {
		value(option.value);
		closeDropdown();
		onChange()(option.value);
	}

	// Track parent scroll listeners
	let parentScrollListeners = [];

	// Find all scrollable parent elements
	function getScrollableParents(element) {
		const parents = [];
		let parent = element.parentElement;

		while (parent && parent !== document.body) {
			const style = window.getComputedStyle(parent);
			const overflow = style.overflow + style.overflowY + style.overflowX;

			// Check if element is scrollable
			if (overflow.includes('scroll') || overflow.includes('auto')) {
				parents.push(parent);
			}

			parent = parent.parentElement;
		}

		return parents;
	}

	// Check if the select button is actually visible (not just in viewport bounds)
	function isSelectVisible() {
		if (!container) return false;

		const rect = container.getBoundingClientRect();
		const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
		const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

		// First check if it's completely outside viewport
		if (rect.bottom <= 0 || rect.top >= viewportHeight || rect.right <= 0 || rect.left >= viewportWidth) {
			return false;
		}

		// Check if the element is actually visible by testing a point in the center
		const centerX = rect.left + rect.width / 2;

		const centerY = rect.top + rect.height / 2;

		// Make sure the center point is within viewport
		if (centerX < 0 || centerX >= viewportWidth || centerY < 0 || centerY >= viewportHeight) {
			return false;
		}

		// Use elementFromPoint to check if our container is actually visible at its center
		const elementAtPoint = document.elementFromPoint(centerX, centerY);

		// Check if the element at that point is our container or a child of our container
		return !!(elementAtPoint && (elementAtPoint === container || container.contains(elementAtPoint)));
	}

	// Add scroll listeners to all parent containers
	function addParentScrollListeners() {
		if (!container) return;

		// Remove existing listeners first
		removeParentScrollListeners();

		const scrollableParents = getScrollableParents(container);

		scrollableParents.forEach((parent) => {
			const listener = () => {
				if ($.get(isOpen)) {
					// Check if select is still visible, close dropdown if not
					if (!isSelectVisible()) {
						closeDropdown({ preventFocus: true });
					} else {
						positionDropdown();
					}
				}
			};

			parent.addEventListener('scroll', listener, { passive: true });
			parentScrollListeners.push({ element: parent, listener });
		});
	}

	// Remove all parent scroll listeners
	function removeParentScrollListeners() {
		parentScrollListeners.forEach(({ element, listener }) => {
			element.removeEventListener('scroll', listener);
		});

		parentScrollListeners = [];
	}

	// Mount event listeners
	onMount(() => {
		// Use mousedown to catch all interactions, including ones on buttons
		document.addEventListener('mousedown', handleOutsideClick);

		window.addEventListener('resize', positionDropdown);

		// Window scroll handler with visibility check
		const windowScrollHandler = () => {
			if ($.get(isOpen)) {
				if (!isSelectVisible()) {
					closeDropdown({ preventFocus: true });
				} else {
					positionDropdown();
				}
			}
		};

		window.addEventListener('scroll', windowScrollHandler);

		// Add parent scroll listeners
		addParentScrollListeners();

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
			window.removeEventListener('resize', positionDropdown);
			window.removeEventListener('scroll', windowScrollHandler);
			removeParentScrollListeners();

			if (closeTimeout) window.clearTimeout(closeTimeout);
		};
	});

	// Update dropdown position when options change (which affects dropdown size)
	$.user_effect(() => {
		if ($.get(isOpen)) {
			void $.get(filteredOptions // Track changes to trigger reposition
			);
			requestAnimationFrame(positionDropdown);
		}
	});

	var fragment = root_11();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var label_1 = root();
			var text = $.only_child(label_1, true);

			$.template_effect(() => {
				$.set_attribute(label_1, 'for', `select-button-${$.get(uniqueId)}`);
				$.set_attribute(label_1, 'id', `select-label-${$.get(uniqueId)}`);
				$.set_text(text, label());
			});

			$.append($$anchor, label_1);
		};

		var consequent_1 = ($$anchor) => {
			var label_2 = root_1();
			var text_1 = $.only_child(label_2, true);

			$.template_effect(() => {
				$.set_attribute(label_2, 'for', `select-button-${$.get(uniqueId)}`);
				$.set_attribute(label_2, 'id', `select-label-${$.get(uniqueId)}`);
				$.set_text(text_1, label());
			});

			$.append($$anchor, label_2);
		};

		$.if(node, ($$render) => {
			if (label() && !hideLabel()) $$render(consequent); else if (label() && hideLabel()) $$render(consequent_1, 1);
		});
	}

	var div = $.sibling(node, 2);
	var button_1 = $.child(div);
	var span = $.child(button_1);
	var node_1 = $.child(span);

	{
		var consequent_2 = ($$anchor) => {
			const IconComponent = $.derived(() => $.get(selectedOption).icon);
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => $.get(IconComponent), ($$anchor, IconComponent_1) => {
				IconComponent_1($$anchor, { class: 'size-4 flex-shrink-0' });
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(selectedOption)?.icon) $$render(consequent_2);
		});
	}

	var text_2 = $.sibling(node_1);
	var node_3 = $.sibling(text_2);

	{
		var consequent_3 = ($$anchor) => {
			var span_1 = root_2();
			var text_3 = $.only_child(span_1);

			$.template_effect(() => {
				$.set_class(span_1, 1, $.clsx($.get(genderClass)));
				$.set_text(text_3, `(${$.get(displayGender) ?? ''})`);
			});

			$.append($$anchor, span_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(displayGender)) $$render(consequent_3);
		});
	}

	$.reset(span);

	var div_1 = $.sibling(span, 2);
	var node_4 = $.child(div_1);

	IconChevronUp(node_4, { class: 'text-primary-700 absolute top-[-2px] size-3' });

	var node_5 = $.sibling(node_4, 2);

	IconChevronDown(node_5, { class: 'text-primary-700 absolute bottom-[-2px] size-3' });
	$.reset(div_1);
	$.reset(button_1);

	var node_6 = $.sibling(button_1, 2);

	{
		var consequent_15 = ($$anchor) => {
			Portal($$anchor, {
				target: 'body',
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_10();
					var node_7 = $.child(div_2);

					{
						var consequent_5 = ($$anchor) => {
							var div_3 = root_4();
							var div_4 = $.child(div_3);
							var input = $.child(div_4);

							$.remove_input_defaults(input);
							$.bind_this(input, ($$value) => $.set(search, $$value), () => $.get(search));

							var div_5 = $.sibling(input, 2);
							var node_8 = $.child(div_5);

							IconSearch(node_8, { class: 'icon-color-muted size-4' });
							$.reset(div_5);

							var node_9 = $.sibling(div_5, 2);

							{
								var consequent_4 = ($$anchor) => {
									var button_2 = root_3();
									var node_10 = $.child(button_2);

									IconX(node_10, { class: 'size-4' });
									$.reset(button_2);

									$.delegated('mousedown', button_2, (e) => {
										e.stopPropagation();
										$.set(filter, "");
										focusElement($.get(search));
									});

									$.append($$anchor, button_2);
								};

								$.if(node_9, ($$render) => {
									if ($.get(filter)) $$render(consequent_4);
								});
							}

							$.reset(div_4);
							$.reset(div_3);

							$.template_effect(
								($0, $1) => {
									$.set_attribute(input, 'placeholder', $0);
									$.set_attribute(input, 'aria-label', $1);
								},
								[
									() => s("common.search") || "Search",
									() => s("common.search") || "Search"
								]
							);

							$.bind_value(input, () => $.get(filter), ($$value) => $.set(filter, $$value));
							$.append($$anchor, div_3);
						};

						$.if(node_7, ($$render) => {
							if (searchable()) $$render(consequent_5);
						});
					}

					var div_6 = $.sibling(node_7, 2);
					var node_11 = $.child(div_6);

					$.bind_this(
						OverlayScrollbarsComponent(node_11, {
							options: { scrollbars: { autoHide: "leave", autoHideDelay: 100 } },
							children: ($$anchor, $$slotProps) => {
								var div_7 = root_9();
								var node_12 = $.child(div_7);

								{
									var consequent_6 = ($$anchor) => {
										var div_8 = root_5();
										var text_4 = $.only_child(div_8, true);

										$.template_effect(($0) => $.set_text(text_4, $0), [() => s("common.no_results") || "No results found"]);
										$.append($$anchor, div_8);
									};

									var alternate_2 = ($$anchor) => {
										var fragment_3 = $.comment();
										var node_13 = $.first_child(fragment_3);

										$.each(node_13, 17, () => $.get(filteredOptions), $.index, ($$anchor, option, idx) => {
											const isLastOption = $.derived(() => idx === $.get(filteredOptions).length - 1);
											var fragment_4 = $.comment();
											var node_14 = $.first_child(fragment_4);

											{
												var consequent_7 = ($$anchor) => {
													var div_9 = root_6();
													var text_5 = $.only_child(div_9, true);

													$.template_effect(() => $.set_text(text_5, $.get(option).label));
													$.append($$anchor, div_9);
												};

												var alternate_1 = ($$anchor) => {
													var fragment_5 = $.comment();
													var node_15 = $.first_child(fragment_5);

													{
														var consequent_11 = ($$anchor) => {
															Tooltip($$anchor, {
																get text() {
																	return $.get(option).tooltip;
																},
																position: 'right',
																children: ($$anchor, $$slotProps) => {
																	var button_3 = root_8();
																	var node_16 = $.child(button_3);

																	{
																		var consequent_8 = ($$anchor) => {
																			var span_2 = root_7();
																			var node_17 = $.child(span_2);

																			IconCheck(node_17, { class: 'size-5 stroke-[2.5]' });
																			$.reset(span_2);
																			$.append($$anchor, span_2);
																		};

																		$.if(node_16, ($$render) => {
																			if (value() === $.get(option).value) $$render(consequent_8);
																		});
																	}

																	var span_3 = $.sibling(node_16, 2);
																	var node_18 = $.child(span_3);

																	{
																		var consequent_9 = ($$anchor) => {
																			const IconComponent = $.derived(() => $.get(option).icon);
																			var fragment_7 = $.comment();
																			var node_19 = $.first_child(fragment_7);

																			$.component(node_19, () => $.get(IconComponent), ($$anchor, IconComponent_2) => {
																				IconComponent_2($$anchor, { class: 'size-4' });
																			});

																			$.append($$anchor, fragment_7);
																		};

																		$.if(node_18, ($$render) => {
																			if ($.get(option).icon) $$render(consequent_9);
																		});
																	}

																	var text_6 = $.sibling(node_18);
																	var node_20 = $.sibling(text_6);

																	{
																		var consequent_10 = ($$anchor) => {
																			var span_4 = root_2();
																			var text_7 = $.only_child(span_4);

																			$.template_effect(() => {
																				$.set_class(span_4, 1, $.clsx($.get(option).gender === "M"
																					? "text-blue-400/70 dark:text-blue-400/80"
																					: $.get(option).gender === "F"
																						? "text-pink-400/70 dark:text-pink-400/80"
																						: "text-purple-400/70 dark:text-purple-400/80"));

																				$.set_text(text_7, `(${$.get(option).gender ?? ''})`);
																			});

																			$.append($$anchor, span_4);
																		};

																		$.if(node_20, ($$render) => {
																			if ($.get(option).gender) $$render(consequent_10);
																		});
																	}

																	$.reset(span_3);
																	$.reset(button_3);

																	$.template_effect(() => {
																		$.set_class(button_3, 1, `focus-visible:ring-focus-ring relative flex w-full cursor-pointer items-center px-4 py-2 ps-8 text-start text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-inset dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:focus-visible:bg-gray-600 ${$.get(isLastOption) ? 'rounded-b-lg' : ''}`);
																		$.set_attribute(button_3, 'aria-selected', value() === $.get(option).value);
																		$.set_class(span_3, 1, `flex items-center gap-2 ${value() === $.get(option).value ? 'font-bold' : ''}`);
																		$.set_text(text_6, ` ${$.get(option).label ?? ''} `);
																	});

																	$.delegated('mousedown', button_3, (e) => {
																		e.stopPropagation();
																		handleSelect($.get(option));
																	});

																	$.delegated('keydown', button_3, (e) => {
																		if (e.key === "Enter" || e.key === " ") {
																			e.preventDefault();
																			e.stopPropagation();
																			handleSelect($.get(option));
																		} else if (e.key === "Escape") {
																			e.preventDefault();
																			e.stopPropagation();
																			closeDropdown();
																			focusElement(container.querySelector("button"));
																		} else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
																			e.preventDefault();
																			e.stopPropagation();

																			const optionButtons = [
																				...$.get(fieldset)?.querySelectorAll('button[role="option"]') || []
																			];

																			const currentIndex = optionButtons.indexOf(e.currentTarget);

																			// Calculate target index with wrap-around
																			const targetIndex = e.key === "ArrowDown"
																				? (currentIndex + 1) % optionButtons.length
																				: (currentIndex - 1 + optionButtons.length) % optionButtons.length;

																			// Focus the target option
																			focusElement(optionButtons[targetIndex]);

																			// Ensure it's visible in the scroll area
																			optionButtons[targetIndex]?.scrollIntoView({ block: "nearest" });
																		} else if (e.key === "Tab") {
																			// Handle Tab navigation between options
																			const optionButtons = [
																				...$.get(fieldset)?.querySelectorAll('button[role="option"]') || []
																			];

																			const currentIndex = optionButtons.indexOf(e.currentTarget);

																			if (e.shiftKey && currentIndex === 0) {
																				// If Shift+Tab on first option, close dropdown and return to button
																				e.preventDefault();

																				closeDropdown();
																				focusElement(container.querySelector("button"));
																			} else if (!e.shiftKey && currentIndex === optionButtons.length - 1) {
																				// If Tab on last option, close dropdown and let natural tab flow continue
																				closeDropdown();

																				// Don't prevent default to let tab continue naturally
																			} else {
																				// Otherwise let native tab behavior work between options
																				// No need to prevent default
																			}
																		}
																	});

																	$.append($$anchor, button_3);
																},
																$$slots: { default: true }
															});
														};

														var alternate = ($$anchor) => {
															var button_4 = root_8();
															var node_21 = $.child(button_4);

															{
																var consequent_12 = ($$anchor) => {
																	var span_5 = root_7();
																	var node_22 = $.child(span_5);

																	IconCheck(node_22, { class: 'size-5 stroke-[2.5]' });
																	$.reset(span_5);
																	$.append($$anchor, span_5);
																};

																$.if(node_21, ($$render) => {
																	if (value() === $.get(option).value) $$render(consequent_12);
																});
															}

															var span_6 = $.sibling(node_21, 2);
															var node_23 = $.child(span_6);

															{
																var consequent_13 = ($$anchor) => {
																	const IconComponent = $.derived(() => $.get(option).icon);
																	var fragment_8 = $.comment();
																	var node_24 = $.first_child(fragment_8);

																	$.component(node_24, () => $.get(IconComponent), ($$anchor, IconComponent_3) => {
																		IconComponent_3($$anchor, { class: 'size-4' });
																	});

																	$.append($$anchor, fragment_8);
																};

																$.if(node_23, ($$render) => {
																	if ($.get(option).icon) $$render(consequent_13);
																});
															}

															var text_8 = $.sibling(node_23);
															var node_25 = $.sibling(text_8);

															{
																var consequent_14 = ($$anchor) => {
																	var span_7 = root_2();
																	var text_9 = $.only_child(span_7);

																	$.template_effect(() => {
																		$.set_class(span_7, 1, $.clsx($.get(option).gender === "M"
																			? "text-blue-400/70 dark:text-blue-400/80"
																			: $.get(option).gender === "F"
																				? "text-pink-400/70 dark:text-pink-400/80"
																				: "text-purple-400/70 dark:text-purple-400/80"));

																		$.set_text(text_9, `(${$.get(option).gender ?? ''})`);
																	});

																	$.append($$anchor, span_7);
																};

																$.if(node_25, ($$render) => {
																	if ($.get(option).gender) $$render(consequent_14);
																});
															}

															$.reset(span_6);
															$.reset(button_4);

															$.template_effect(() => {
																$.set_class(button_4, 1, `focus-visible:ring-focus-ring relative flex w-full cursor-pointer items-center px-4 py-2 ps-8 text-start text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-inset dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:focus-visible:bg-gray-600 ${$.get(isLastOption) ? 'rounded-b-lg' : ''}`);
																$.set_attribute(button_4, 'aria-selected', value() === $.get(option).value);
																$.set_class(span_6, 1, `flex items-center gap-2 ${value() === $.get(option).value ? 'font-bold' : ''}`);
																$.set_text(text_8, ` ${$.get(option).label ?? ''} `);
															});

															$.delegated('mousedown', button_4, (e) => {
																e.stopPropagation();
																handleSelect($.get(option));
															});

															$.delegated('keydown', button_4, (e) => {
																if (e.key === "Enter" || e.key === " ") {
																	e.preventDefault();
																	e.stopPropagation();
																	handleSelect($.get(option));
																} else if (e.key === "Escape") {
																	e.preventDefault();
																	e.stopPropagation();
																	closeDropdown();
																	focusElement(container.querySelector("button"));
																} else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
																	e.preventDefault();
																	e.stopPropagation();

																	const optionButtons = [
																		...$.get(fieldset)?.querySelectorAll('button[role="option"]') || []
																	];

																	const currentIndex = optionButtons.indexOf(e.currentTarget);

																	// Calculate target index with wrap-around
																	const targetIndex = e.key === "ArrowDown"
																		? (currentIndex + 1) % optionButtons.length
																		: (currentIndex - 1 + optionButtons.length) % optionButtons.length;

																	focusElement(optionButtons[targetIndex]);
																} else if (e.key === "Tab") {
																	const optionButtons = [
																		...$.get(fieldset)?.querySelectorAll('button[role="option"]') || []
																	];

																	const currentIndex = optionButtons.indexOf(e.currentTarget);

																	if (e.shiftKey && currentIndex === 0) {
																		// If Shift+Tab on first option, close dropdown and return to button
																		e.preventDefault();

																		closeDropdown();
																		focusElement(container.querySelector("button"));
																	} else if (!e.shiftKey && currentIndex === optionButtons.length - 1) {
																		// If Tab on last option, close dropdown and let natural tab flow continue
																		closeDropdown();

																		// Don't prevent default to let tab continue naturally
																	} else {
																		// Otherwise let native tab behavior work between options
																		// No need to prevent default
																	}
																}
															});

															$.append($$anchor, button_4);
														};

														$.if(node_15, ($$render) => {
															if ($.get(option).tooltip) $$render(consequent_11); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_5);
												};

												$.if(node_14, ($$render) => {
													if ($.get(option).disabled) $$render(consequent_7); else $$render(alternate_1, -1);
												});
											}

											$.append($$anchor, fragment_4);
										});

										$.append($$anchor, fragment_3);
									};

									$.if(node_12, ($$render) => {
										if ($.get(filteredOptions).length === 0) $$render(consequent_6); else $$render(alternate_2, -1);
									});
								}

								$.reset(div_7);
								$.bind_this(div_7, ($$value) => $.set(fieldset, $$value), () => $.get(fieldset));

								$.template_effect(() => {
									$.set_attribute(div_7, 'id', `select-options-${$.get(uniqueId)}`);
									$.set_attribute(div_7, 'aria-labelledby', `select-button-${$.get(uniqueId)}`);
								});

								$.append($$anchor, div_7);
							},
							$$slots: { default: true }
						}),
						($$value) => $.set(overlayScrollbars, $$value, true),
						() => $.get(overlayScrollbars)
					);

					$.reset(div_6);
					$.reset(div_2);
					$.bind_this(div_2, ($$value) => $.set(dropdown, $$value), () => $.get(dropdown));
					$.delegated('mousedown', div_2, (e) => e.stopPropagation());
					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_6, ($$render) => {
			if ($.get(isOpen)) $$render(consequent_15);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(() => {
		$.set_class(div, 1, `relative select-none ${className() ?? ''} z-dropdown`);
		$.set_class(button_1, 1, `flex ${height() ?? ''} focus-visible:ring-focus-ring w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`);
		$.set_attribute(button_1, 'id', `select-button-${$.get(uniqueId)}`);
		$.set_attribute(button_1, 'aria-labelledby', label() ? `select-label-${$.get(uniqueId)}` : undefined);
		$.set_attribute(button_1, 'aria-label', !label() ? placeholder() : undefined);
		$.set_attribute(button_1, 'aria-expanded', $.get(isOpen));
		$.set_attribute(button_1, 'aria-controls', $.get(isOpen) ? `select-options-${$.get(uniqueId)}` : undefined);
		$.set_class(span, 1, `flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap ${value() ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}`);
		$.set_text(text_2, ` ${$.get(displayValue) ?? ''} `);
	});

	$.delegated('mousedown', button_1, (e) => {
		e.stopPropagation();
		toggleDropdown(e);
	});

	$.delegated('keydown', button_1, (e) => {
		if (e.key === "Escape") {
			closeDropdown();
			e.preventDefault();
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			e.stopPropagation();
			toggleDropdown(e);
		} else if (e.key === "ArrowDown") {
			e.preventDefault();

			if (!$.get(isOpen)) {
				// Open dropdown (focus handled in toggleDropdown)
				toggleDropdown(e);
			} else {
				// Focus first option
				const firstOption = $.get(fieldset)?.querySelector('button[role="option"]');

				if (firstOption) {
					focusElement(firstOption);
				}
			}
		} else if (e.key === "ArrowUp") {
			e.preventDefault();

			if (!$.get(isOpen)) {
				// Open dropdown (focus handled in toggleDropdown)
				toggleDropdown(e);
			} else {
				// Focus last option
				const options = $.get(fieldset)?.querySelectorAll('button[role="option"]');

				if (options && options.length > 0) {
					focusElement(options[options.length - 1]);
				}
			}
		} else if (e.key === "Tab" && $.get(isOpen)) {
			if (e.shiftKey) {
				// If Shift+Tab, close dropdown and let focus move to previous element
				closeDropdown();

				// Don't prevent default to let browser handle focus movement
			} else {
				// If regular Tab, move focus into the dropdown
				e.preventDefault();

				const firstOption = $.get(fieldset)?.querySelector('button[role="option"]');

				if (firstOption) {
					focusElement(firstOption);
				}
			}
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['mousedown', 'keydown']);