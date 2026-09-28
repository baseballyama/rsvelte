import * as $ from 'svelte/internal/server';
import { onDestroy, onMount, setContext as setThemeContext } from 'svelte';
import { writable } from 'svelte/store';
import { paletteStore } from '../store/PaletteStore';
import Portal from './Portal.svelte';
import ResultPanel from './ResultPanel.svelte';
import KeyboardButton from './KeyboardButton.svelte';
import createShortcuts from '../utils/createShortcuts';

import {
	createFuse,
	formatResults,
	getNonEmptyArray,
	runAction,
	toCssString
} from '../utils';

import createStoreMethods from '../utils/createStoreMethods';
import createActionMap from '../utils/createActionMap';
import { THEME_CONTEXT } from '../constants';

export default function CommandPalette($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Component-level event callbacks
		// Style classes
		// Style objects
		// Custom rendering
		let {
			commands: commandsProp = [],
			placeholder = 'Search for an action...',
			shortcut = '$mod+k',
			onOpen,
			onClose,
			onActionSelect,
			inputClass = null,
			overlayClass = null,
			paletteWrapperInnerClass = null,
			resultsContainerClass = null,
			resultContainerClass = null,
			optionSelectedClass = null,
			titleClass = null,
			subtitleClass = null,
			descriptionClass = null,
			keyboardButtonClass = null,
			unstyled = false,
			inputStyle = {},
			overlayStyle = {},
			paletteWrapperInnerStyle = {},
			resultsContainerStyle = {},
			resultContainerStyle = {},
			optionSelectedStyle = {},
			titleStyle = {},
			subtitleStyle = {},
			descriptionStyle = {},
			keyboardButtonStyle = {},
			emptyState
		} = $$props;

		let wrapperElement = void 0;
		let searchInputRef = void 0;
		let commandPaletteRef = void 0;
		let unsubscribeKbdListener;
		let isPaletteVisible = false;
		let activeCommand = null;
		let lastActiveElement = null;
		let searchResults = [];
		const searchInputId = 'paletteInput';
		let actions = [];

		// set themes to context to pass down to deeply nested components
		const themeStore = writable({});

		setThemeContext(THEME_CONTEXT, themeStore);

		const storeMethods = createStoreMethods();
		let formattedEscKey = '';
		const { togglePalette, closePalette: closeCommandPalette } = storeMethods;

		// Create actionMap reactively based on commandsProp
		let actionMap = $.derived(() => createActionMap(commandsProp));

		const updateStore = () => {
			paletteStore.update((n) => ({
				...n,
				commands: commandsProp,
				storeMethods,
				actionMap: createActionMap(commandsProp),
				activeCommandId: null,
				results: commandsProp
			}));
		};

		// Initial store update
		// Track visibility changes for callbacks
		let prevVisible = false;

		const unsubscribePaletteStore = paletteStore.subscribe((value) => {
			const wasVisible = prevVisible;

			isPaletteVisible = value.isVisible;
			actions = value.commands;
			activeCommand = value.activeCommandId ?? null;
			searchResults = getNonEmptyArray(value.results, value.commands, []);

			// Fire callbacks on visibility change
			if (!wasVisible && value.isVisible) {
				lastActiveElement = document.activeElement;
				onOpen?.();
			} else if (wasVisible && !value.isVisible) {
				onClose?.();
			}

			prevVisible = value.isVisible;
		});

		const focusLastElement = () => {
			if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
				lastActiveElement.focus();
			}
		};

		const closePalette = (event) => {
			event?.preventDefault?.();
			closeCommandPalette();
			focusLastElement();
		};

		const focusSearchInput = () => {
			if (isPaletteVisible && searchInputRef) {
				searchInputRef.focus();
			}
		};

		const setActiveCommand = (id) => {
			paletteStore.update((n) => ({ ...n, activeCommandId: id }));
		};

		// Only handle arrow keys when palette is visible
		const handleArrowUp = (event) => {
			if (!isPaletteVisible) return;

			event.preventDefault();

			let activeCommandIndex = searchResults.findIndex((a) => a.actionId === activeCommand) ?? 0;

			activeCommandIndex = activeCommandIndex === -1 ? 0 : activeCommandIndex;

			const totalCommands = searchResults.length;
			const prevCommandIndex = (totalCommands + activeCommandIndex - 1) % totalCommands;
			const indexToSet = searchResults[prevCommandIndex] ? prevCommandIndex : activeCommandIndex;

			setActiveCommand(searchResults[indexToSet]?.actionId || '');
		};

		const handleArrowDown = (event) => {
			if (!isPaletteVisible) return;

			event.preventDefault();

			if (searchResults.length) {
				let activeCommandIndex = searchResults.findIndex((a) => a.actionId === activeCommand) ?? 0;

				activeCommandIndex = activeCommandIndex === -1 ? -1 : activeCommandIndex;

				const totalCommands = searchResults.length;
				const nextCommand = (activeCommandIndex + 1) % totalCommands;
				const indexToSet = searchResults[nextCommand] ? nextCommand : activeCommandIndex;

				setActiveCommand(searchResults[indexToSet]?.actionId || '');
			}
		};

		const handleEnterKey = (event) => {
			if (!isPaletteVisible) return;

			event.preventDefault();

			const action = actionMap()[activeCommand];

			if (action) {
				onActionSelect?.(action);
				runAction({ action });
			}
		};

		const handleOutsideClick = (event) => {
			if (commandPaletteRef && !commandPaletteRef.contains(event.target)) {
				closePalette();
			}
		};

		const toggleCommandPalette = (event) => {
			event.preventDefault();
			togglePalette();
		};

		// Focus trap - handle Tab key
		const handleTab = (event) => {
			if (!isPaletteVisible || !commandPaletteRef) return;

			const focusableElements = commandPaletteRef.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement?.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement?.focus();
			}
		};

		onMount(async () => {
			const { tinykeys, parseKeybinding } = await import('tinykeys');

			formattedEscKey = parseKeybinding('Esc').flat().join('');

			const shortcuts = createShortcuts({ actions: commandsProp });

			// Build keyboard bindings with customizable shortcut
			const keyBindings = {
				...shortcuts,
				[shortcut]: toggleCommandPalette,
				Escape: closePalette,
				ArrowUp: handleArrowUp,
				ArrowDown: handleArrowDown,
				Enter: handleEnterKey,
				Tab: handleTab
			};

			unsubscribeKbdListener = tinykeys(window, keyBindings);
		});

		// Create fuse reactively based on actions
		let fuse = $.derived(() => createFuse(actions));

		const updateSearchResults = (results) => {
			paletteStore.update((n) => ({ ...n, results, activeCommandId: results?.[0]?.actionId || '' }));
		};

		const handleSearch = (event) => {
			event.preventDefault();

			let results = [...actions];

			if ($.store_get($$store_subs ??= {}, '$paletteStore', paletteStore).textInput) {
				const value = $.store_get($$store_subs ??= {}, '$paletteStore', paletteStore).textInput;

				results = formatResults(fuse().search(value));
			}

			updateSearchResults(results);
		};

		// Effect for focusing and click handler setup
		// Separate effect for theme store updates
		onDestroy(() => {
			unsubscribeKbdListener?.();
			unsubscribePaletteStore();
			focusLastElement();
		});

		const handleFormSubmit = (ev) => ev.preventDefault();

		{
			function children($$renderer) {
				if (isPaletteVisible) {
					$$renderer.push(`<!--[0--><div id="command-palette-overlay"${$.attr_class($.clsx(overlayClass), 'svelte-wh9uu8', { 'cp-overlay': !unstyled })}${$.attr_style(toCssString(overlayStyle))} role="presentation"><div class="cp-wrapper" role="dialog" aria-modal="true" aria-label="Command palette"><div${$.attr_class($.clsx(paletteWrapperInnerClass), 'svelte-wh9uu8', { 'cp-container': !unstyled })}${$.attr_style(toCssString(paletteWrapperInnerStyle))} role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-controls="command-palette-results"><form autocomplete="off" role="search" novalidate="" class="svelte-wh9uu8"><label${$.attr('for', searchInputId)} class="sr-only svelte-wh9uu8">Search for an action</label> <div class="cp-input-wrapper svelte-wh9uu8"><svg class="cp-search-icon svelte-wh9uu8" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> <input type="text"${$.attr_class($.clsx(inputClass), 'svelte-wh9uu8', { 'cp-input': !unstyled })}${$.attr_style(toCssString(inputStyle))}${$.attr('placeholder', placeholder)} aria-autocomplete="list"${$.attr('spellcheck', false)}${$.attr('aria-activedescendant', activeCommand ? `palette-${activeCommand}` : undefined)}${$.attr('id', searchInputId)} autocomplete="off" autocapitalize="off"${$.attr('value', $.store_get($$store_subs ??= {}, '$paletteStore', paletteStore).textInput)}/> `);

					{
						function children($$renderer) {
							$$renderer.push(`<!---->${$.escape(formattedEscKey)}`);
						}

						KeyboardButton($$renderer, {
							onKeyboardButtonClicked: () => closePalette(),
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----></div></form> `);
					ResultPanel($$renderer, { emptyState });
					$$renderer.push(`<!----></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Portal($$renderer, { target: 'body', children, $$slots: { default: true } });
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}