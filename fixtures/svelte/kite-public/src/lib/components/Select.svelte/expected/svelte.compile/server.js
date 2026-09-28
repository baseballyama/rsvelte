import * as $ from 'svelte/internal/server';
import { IconCheck, IconChevronDown, IconChevronUp, IconSearch, IconX } from '@tabler/icons-svelte';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
import { onMount, tick } from 'svelte';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';

export default function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Define the Option type
		// Optional gender field
		// Optional Tabler icon component
		// Optional tooltip text
		// Optional disabled state (for separators)
		let {
			value = '',
			options = [],
			placeholder = 'Select an option',
			className = '',
			searchable = false,
			onChange = (_selectedValue) => {},
			id = '',
			label = '',
			hideLabel = false,
			height = 'h-10'
		} = $$props;

		// Internal state
		let container = undefined; // Assigned via bind:this

		let dropdown = null;
		let fieldset = null;
		let search = null;
		let isOpen = false;
		let filter = '';
		let uniqueId = '';
		let overlayScrollbars = null;
		let closeTimeout = null;

		// Generate unique ID for aria attributes
		try {
			uniqueId = id || crypto.randomUUID();
		} catch(e) {
			console.error(e);
			uniqueId = crypto.getRandomValues(new Uint32Array(36)).toString();
		}

		// Filtered options based on search filter
		let filteredOptions = $.derived(() => filter
			? options.filter((option) => option.label.toLowerCase().includes(filter.toLowerCase()))
			: options);

		// Current selected option
		let selectedOption = $.derived(() => options.find((option) => option.value === value));

		let displayValue = $.derived(() => selectedOption() ? selectedOption().label : placeholder);
		let displayGender = $.derived(() => selectedOption()?.gender);

		let genderClass = $.derived(() => displayGender() === 'M'
			? 'text-blue-400/70 dark:text-blue-400/80'
			: displayGender() === 'F'
				? 'text-pink-400/70 dark:text-pink-400/80'
				: displayGender() === 'N' ? 'text-purple-400/70 dark:text-purple-400/80' : '');

		// Focus an element safely with type checking
		function focusElement(element) {
			if (element && typeof element.focus === 'function') {
				element.focus();
			}
		}

		// Position the dropdown relative to the container when portaled
		async function positionDropdown() {
			if (!dropdown || !container) return;

			await tick(); // Wait for DOM to update

			const rect = container.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;

			// First set the width to ensure proper height calculation
			dropdown.style.width = `${Math.max(rect.width, 120)}px`; // minimum width of 120px

			// Get dropdown dimensions after setting width
			const dropdownHeight = dropdown.offsetHeight || 300;

			const dropdownWidth = dropdown.offsetWidth || rect.width;

			// Calculate space available below and above
			const spaceBelow = viewportHeight - rect.bottom;

			const spaceAbove = rect.top;

			// Use position above when there's not enough space below
			// or when there's more space above than below and the dropdown doesn't fit below
			const positionAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight || spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

			// Set fixed positioning
			dropdown.style.position = 'fixed';

			if (positionAbove) {
				// Position above with 5px gap
				dropdown.style.bottom = `${viewportHeight - rect.top + 5}px`;

				dropdown.style.top = 'auto';
			} else {
				// Position below with 5px gap
				dropdown.style.top = `${rect.bottom + 5}px`;

				dropdown.style.bottom = 'auto';
			}

			// Set horizontal position (default to start-aligned)
			dropdown.style.left = `${rect.left}px`;

			// Adjust if dropdown would go off-screen to the right
			if (rect.left + dropdownWidth > viewportWidth) {
				// Try to align with right edge of container
				const rightAligned = Math.max(0, rect.right - dropdownWidth);

				dropdown.style.left = `${rightAligned}px`;
			}
		}

		// Handle opening and closing the dropdown
		async function toggleDropdown(event) {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			isOpen = !isOpen;

			if (isOpen) {
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
								const options = fieldset?.querySelectorAll('button[role="option"]');

								if (options && options.length > 0) {
									focusElement(options[options.length - 1]);
								}
							} else {
								// Focus first option for other keys
								const firstOption = fieldset?.querySelector('button[role="option"]');

								if (firstOption) {
									focusElement(firstOption);
								} else if (searchable) {
									// If no options or searchable, focus the search input
									focusElement(search);
								}
							}
						},
						10
					);
				} else if (searchable) {
					// Always focus search field if searchable (standard pattern)
					setTimeout(
						() => {
							focusElement(search);
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
			if (!isOpen) return;

			// Ignore clicks on the container (button) itself - these are handled by toggleDropdown
			if (container?.contains(event.target)) {
				return;
			}

			// Ignore clicks on the dropdown contents
			if (dropdown?.contains(event.target)) {
				return;
			}

			// If we got here, it's a click outside both the button and dropdown, so close it
			closeDropdown();
		}

		function closeDropdown(options = {}) {
			isOpen = false;
			filter = '';

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
			value = option.value;
			closeDropdown();
			onChange(option.value);
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
					if (isOpen) {
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
				if (isOpen) {
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

		if (// Update dropdown position when options change (which affects dropdown size)
		// Track changes to trigger reposition
		label && !hideLabel) {
			$$renderer.push(`<!--[0--><label${$.attr('for', `select-button-${uniqueId}`)}${$.attr('id', `select-label-${uniqueId}`)} class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">${$.escape(label)}</label>`);
		} else if (label && hideLabel) {
			$$renderer.push(`<!--[1--><label${$.attr('for', `select-button-${uniqueId}`)}${$.attr('id', `select-label-${uniqueId}`)} class="sr-only">${$.escape(label)}</label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class(`relative select-none ${$.stringify(className)} z-dropdown`)}><button type="button"${$.attr_class(`flex ${$.stringify(height)} focus-visible:ring-focus-ring w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`)}${$.attr('id', `select-button-${uniqueId}`)} role="combobox"${$.attr('aria-labelledby', label ? `select-label-${uniqueId}` : undefined)}${$.attr('aria-label', !label ? placeholder : undefined)} aria-haspopup="listbox"${$.attr('aria-expanded', isOpen)}${$.attr('aria-controls', isOpen ? `select-options-${uniqueId}` : undefined)}><span${$.attr_class(`flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap ${value ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}`)}>`);

		if (selectedOption()?.icon) {
			$$renderer.push('<!--[0-->');

			const IconComponent = selectedOption().icon;

			if (IconComponent) {
				$$renderer.push('<!--[-->');
				IconComponent($$renderer, { class: 'size-4 flex-shrink-0' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> ${$.escape(displayValue())} `);

		if (displayGender()) {
			$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(genderClass()))}>(${$.escape(displayGender())})</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></span> <div class="relative h-4 w-4 flex-shrink-0">`);
		IconChevronUp($$renderer, { class: 'text-primary-700 absolute top-[-2px] size-3' });
		$$renderer.push(`<!----> `);
		IconChevronDown($$renderer, { class: 'text-primary-700 absolute bottom-[-2px] size-3' });
		$$renderer.push(`<!----></div></button> `);

		if (isOpen) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				target: 'body',
				children: ($$renderer) => {
					$$renderer.push(`<div class="pointer-events-auto fixed z-popover overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700" style="min-width: 100px; width: auto; max-height: 300px;" role="dialog" aria-modal="true" tabindex="-1">`);

					if (searchable) {
						$$renderer.push(`<!--[0--><div class="p-3"><div class="relative"><input type="search"${$.attr('value', filter)} class="focus:ring-opacity-50 dark:focus:ring-opacity-30 focus:ring-focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 ps-9 text-sm shadow-sm focus:border-blue-300 focus:ring focus:outline-none dark:border-gray-600 dark:bg-gray-600 dark:text-gray-200 dark:focus:border-blue-600 svelte-t5ihcw"${$.attr('placeholder', s("common.search") || "Search")}${$.attr('aria-label', s("common.search") || "Search")}/> <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">`);
						IconSearch($$renderer, { class: 'icon-color-muted size-4' });
						$$renderer.push(`<!----></div> `);

						if (filter) {
							$$renderer.push(`<!--[0--><button type="button" class="absolute inset-y-0 end-0 flex cursor-pointer items-center pe-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Clear search">`);
							IconX($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----></button>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div style="max-height: 250px;">`);

					OverlayScrollbarsComponent($$renderer, {
						options: { scrollbars: { autoHide: "leave", autoHideDelay: 100 } },
						children: ($$renderer) => {
							$$renderer.push(`<div class="py-1" role="listbox"${$.attr('id', `select-options-${uniqueId}`)}${$.attr('aria-labelledby', `select-button-${uniqueId}`)} style="max-height: 250px;" tabindex="-1">`);

							if (filteredOptions().length === 0) {
								$$renderer.push(`<!--[0--><div class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">${$.escape(s("common.no_results") || "No results found")}</div>`);
							} else {
								$$renderer.push(`<!--[-1--><!--[-->`);

								const each_array = $.ensure_array_like(filteredOptions());

								for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
									let option = each_array[idx];
									const isLastOption = idx === filteredOptions().length - 1;

									if (option.disabled) {
										$$renderer.push(`<!--[0--><div class="px-4 py-2 text-center text-xs text-gray-400 dark:text-gray-500 pointer-events-none select-none" role="separator">${$.escape(option.label)}</div>`);
									} else {
										$$renderer.push('<!--[-1-->');

										if (option.tooltip) {
											$$renderer.push('<!--[0-->');

											Tooltip($$renderer, {
												text: option.tooltip,
												position: 'right',
												children: ($$renderer) => {
													$$renderer.push(`<button type="button"${$.attr_class(`focus-visible:ring-focus-ring relative flex w-full cursor-pointer items-center px-4 py-2 ps-8 text-start text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-inset dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:focus-visible:bg-gray-600 ${isLastOption ? 'rounded-b-lg' : ''}`)} role="option"${$.attr('aria-selected', value === option.value)} tabindex="0">`);

													if (value === option.value) {
														$$renderer.push(`<!--[0--><span class="absolute start-2 font-normal text-gray-900 dark:text-gray-200">`);
														IconCheck($$renderer, { class: 'size-5 stroke-[2.5]' });
														$$renderer.push(`<!----></span>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> <span${$.attr_class(`flex items-center gap-2 ${value === option.value ? 'font-bold' : ''}`)}>`);

													if (option.icon) {
														$$renderer.push('<!--[0-->');

														const IconComponent = option.icon;

														if (IconComponent) {
															$$renderer.push('<!--[-->');
															IconComponent($$renderer, { class: 'size-4' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> ${$.escape(option.label)} `);

													if (option.gender) {
														$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(option.gender === "M"
															? "text-blue-400/70 dark:text-blue-400/80"
															: option.gender === "F"
																? "text-pink-400/70 dark:text-pink-400/80"
																: "text-purple-400/70 dark:text-purple-400/80"))}>(${$.escape(option.gender)})</span>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--></span></button>`);
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push(`<!--[-1--><button type="button"${$.attr_class(`focus-visible:ring-focus-ring relative flex w-full cursor-pointer items-center px-4 py-2 ps-8 text-start text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-inset dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:focus-visible:bg-gray-600 ${isLastOption ? 'rounded-b-lg' : ''}`)} role="option"${$.attr('aria-selected', value === option.value)} tabindex="0">`);

											if (value === option.value) {
												$$renderer.push(`<!--[0--><span class="absolute start-2 font-normal text-gray-900 dark:text-gray-200">`);
												IconCheck($$renderer, { class: 'size-5 stroke-[2.5]' });
												$$renderer.push(`<!----></span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> <span${$.attr_class(`flex items-center gap-2 ${value === option.value ? 'font-bold' : ''}`)}>`);

											if (option.icon) {
												$$renderer.push('<!--[0-->');

												const IconComponent = option.icon;

												if (IconComponent) {
													$$renderer.push('<!--[-->');
													IconComponent($$renderer, { class: 'size-4' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> ${$.escape(option.label)} `);

											if (option.gender) {
												$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(option.gender === "M"
													? "text-blue-400/70 dark:text-blue-400/80"
													: option.gender === "F"
														? "text-pink-400/70 dark:text-pink-400/80"
														: "text-purple-400/70 dark:text-purple-400/80"))}>(${$.escape(option.gender)})</span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></span></button>`);
										}

										$$renderer.push(`<!--]-->`);
									}

									$$renderer.push(`<!--]-->`);
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]--></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		$.bind_props($$props, {
			value,
			options,
			placeholder,
			className,
			searchable,
			onChange,
			id,
			label,
			hideLabel,
			height
		});
	});
}