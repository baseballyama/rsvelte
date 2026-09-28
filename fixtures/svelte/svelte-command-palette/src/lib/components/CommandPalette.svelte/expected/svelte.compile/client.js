import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div id="command-palette-overlay" role="presentation"><div class="cp-wrapper" role="dialog" aria-modal="true" aria-label="Command palette"><div role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-controls="command-palette-results"><form autocomplete="off" role="search" novalidate="" class="svelte-wh9uu8"><label class="sr-only svelte-wh9uu8">Search for an action</label> <div class="cp-input-wrapper svelte-wh9uu8"><svg class="cp-search-icon svelte-wh9uu8" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> <input type="text" aria-autocomplete="list" autocomplete="off" autocapitalize="off"/> <!></div></form> <!></div></div></div>`);

export default function CommandPalette($$anchor, $$props) {
	$.push($$props, true);

	const $paletteStore = () => $.store_get(paletteStore, '$paletteStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Component-level event callbacks
	// Style classes
	// Style objects
	// Custom rendering
	let commandsProp = $.prop($$props, 'commands', 19, () => []),
		placeholder = $.prop($$props, 'placeholder', 3, 'Search for an action...'),
		shortcut = $.prop($$props, 'shortcut', 3, '$mod+k'),
		inputClass = $.prop($$props, 'inputClass', 3, null),
		overlayClass = $.prop($$props, 'overlayClass', 3, null),
		paletteWrapperInnerClass = $.prop($$props, 'paletteWrapperInnerClass', 3, null),
		resultsContainerClass = $.prop($$props, 'resultsContainerClass', 3, null),
		resultContainerClass = $.prop($$props, 'resultContainerClass', 3, null),
		optionSelectedClass = $.prop($$props, 'optionSelectedClass', 3, null),
		titleClass = $.prop($$props, 'titleClass', 3, null),
		subtitleClass = $.prop($$props, 'subtitleClass', 3, null),
		descriptionClass = $.prop($$props, 'descriptionClass', 3, null),
		keyboardButtonClass = $.prop($$props, 'keyboardButtonClass', 3, null),
		unstyled = $.prop($$props, 'unstyled', 3, false),
		inputStyle = $.prop($$props, 'inputStyle', 19, () => ({})),
		overlayStyle = $.prop($$props, 'overlayStyle', 19, () => ({})),
		paletteWrapperInnerStyle = $.prop($$props, 'paletteWrapperInnerStyle', 19, () => ({})),
		resultsContainerStyle = $.prop($$props, 'resultsContainerStyle', 19, () => ({})),
		resultContainerStyle = $.prop($$props, 'resultContainerStyle', 19, () => ({})),
		optionSelectedStyle = $.prop($$props, 'optionSelectedStyle', 19, () => ({})),
		titleStyle = $.prop($$props, 'titleStyle', 19, () => ({})),
		subtitleStyle = $.prop($$props, 'subtitleStyle', 19, () => ({})),
		descriptionStyle = $.prop($$props, 'descriptionStyle', 19, () => ({})),
		keyboardButtonStyle = $.prop($$props, 'keyboardButtonStyle', 19, () => ({}));

	let wrapperElement = $.state(void 0);
	let searchInputRef = $.state(void 0);
	let commandPaletteRef = $.state(void 0);
	let unsubscribeKbdListener;
	let isPaletteVisible = $.state(false);
	let activeCommand = $.state(null);
	let lastActiveElement = null;
	let searchResults = $.state($.proxy([]));
	const searchInputId = 'paletteInput';
	let actions = $.state($.proxy([]));

	// set themes to context to pass down to deeply nested components
	const themeStore = writable({});

	setThemeContext(THEME_CONTEXT, themeStore);

	const storeMethods = createStoreMethods();
	let formattedEscKey = $.state('');
	const { togglePalette, closePalette: closeCommandPalette } = storeMethods;

	// Create actionMap reactively based on commandsProp
	let actionMap = $.derived(() => createActionMap(commandsProp()));

	const updateStore = () => {
		paletteStore.update((n) => ({
			...n,
			commands: commandsProp(),
			storeMethods,
			actionMap: createActionMap(commandsProp()),
			activeCommandId: null,
			results: commandsProp()
		}));
	};

	// Initial store update
	$.user_effect(() => {
		updateStore();
	});

	// Track visibility changes for callbacks
	let prevVisible = false;

	const unsubscribePaletteStore = paletteStore.subscribe((value) => {
		const wasVisible = prevVisible;

		$.set(isPaletteVisible, value.isVisible, true);
		$.set(actions, value.commands, true);
		$.set(activeCommand, value.activeCommandId ?? null, true);
		$.set(searchResults, getNonEmptyArray(value.results, value.commands, []), true);

		// Fire callbacks on visibility change
		if (!wasVisible && value.isVisible) {
			lastActiveElement = document.activeElement;
			$$props.onOpen?.();
		} else if (wasVisible && !value.isVisible) {
			$$props.onClose?.();
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
		if ($.get(isPaletteVisible) && $.get(searchInputRef)) {
			$.get(searchInputRef).focus();
		}
	};

	const setActiveCommand = (id) => {
		paletteStore.update((n) => ({ ...n, activeCommandId: id }));
	};

	// Only handle arrow keys when palette is visible
	const handleArrowUp = (event) => {
		if (!$.get(isPaletteVisible)) return;

		event.preventDefault();

		let activeCommandIndex = $.get(searchResults).findIndex((a) => a.actionId === $.get(activeCommand)) ?? 0;

		activeCommandIndex = activeCommandIndex === -1 ? 0 : activeCommandIndex;

		const totalCommands = $.get(searchResults).length;
		const prevCommandIndex = (totalCommands + activeCommandIndex - 1) % totalCommands;
		const indexToSet = $.get(searchResults)[prevCommandIndex] ? prevCommandIndex : activeCommandIndex;

		setActiveCommand($.get(searchResults)[indexToSet]?.actionId || '');
	};

	const handleArrowDown = (event) => {
		if (!$.get(isPaletteVisible)) return;

		event.preventDefault();

		if ($.get(searchResults).length) {
			let activeCommandIndex = $.get(searchResults).findIndex((a) => a.actionId === $.get(activeCommand)) ?? 0;

			activeCommandIndex = activeCommandIndex === -1 ? -1 : activeCommandIndex;

			const totalCommands = $.get(searchResults).length;
			const nextCommand = (activeCommandIndex + 1) % totalCommands;
			const indexToSet = $.get(searchResults)[nextCommand] ? nextCommand : activeCommandIndex;

			setActiveCommand($.get(searchResults)[indexToSet]?.actionId || '');
		}
	};

	const handleEnterKey = (event) => {
		if (!$.get(isPaletteVisible)) return;

		event.preventDefault();

		const action = $.get(actionMap)[$.get(activeCommand)];

		if (action) {
			$$props.onActionSelect?.(action);
			runAction({ action });
		}
	};

	const handleOutsideClick = (event) => {
		if ($.get(commandPaletteRef) && !$.get(commandPaletteRef).contains(event.target)) {
			closePalette();
		}
	};

	const toggleCommandPalette = (event) => {
		event.preventDefault();
		togglePalette();
	};

	// Focus trap - handle Tab key
	const handleTab = (event) => {
		if (!$.get(isPaletteVisible) || !$.get(commandPaletteRef)) return;

		const focusableElements = $.get(commandPaletteRef).querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
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

		$.set(formattedEscKey, parseKeybinding('Esc').flat().join(''), true);

		const shortcuts = createShortcuts({ actions: commandsProp() });

		// Build keyboard bindings with customizable shortcut
		const keyBindings = {
			...shortcuts,
			[shortcut()]: toggleCommandPalette,
			Escape: closePalette,
			ArrowUp: handleArrowUp,
			ArrowDown: handleArrowDown,
			Enter: handleEnterKey,
			Tab: handleTab
		};

		unsubscribeKbdListener = tinykeys(window, keyBindings);
	});

	// Create fuse reactively based on actions
	let fuse = $.derived(() => createFuse($.get(actions)));

	const updateSearchResults = (results) => {
		paletteStore.update((n) => ({ ...n, results, activeCommandId: results?.[0]?.actionId || '' }));
	};

	const handleSearch = (event) => {
		event.preventDefault();

		let results = [...$.get(actions)];

		if ($paletteStore().textInput) {
			const value = $paletteStore().textInput;

			results = formatResults($.get(fuse).search(value));
		}

		updateSearchResults(results);
	};

	// Effect for focusing and click handler setup
	$.user_effect(() => {
		if ($.get(isPaletteVisible)) {
			focusSearchInput();

			if ($.get(wrapperElement)) {
				$.get(wrapperElement).addEventListener('click', handleOutsideClick);
			}
		}

		return () => {
			$.get(wrapperElement)?.removeEventListener('click', handleOutsideClick);
		};
	});

	// Separate effect for theme store updates
	$.user_effect(() => {
		themeStore.set({
			inputClass: inputClass(),
			overlayClass: overlayClass(),
			paletteWrapperInnerClass: paletteWrapperInnerClass(),
			resultsContainerClass: resultsContainerClass(),
			resultContainerClass: resultContainerClass(),
			optionSelectedClass: optionSelectedClass(),
			titleClass: titleClass(),
			subtitleClass: subtitleClass(),
			descriptionClass: descriptionClass(),
			keyboardButtonClass: keyboardButtonClass(),
			unstyled: unstyled(),
			inputStyle: toCssString(inputStyle()),
			overlayStyle: toCssString(overlayStyle()),
			paletteWrapperInnerStyle: toCssString(paletteWrapperInnerStyle()),
			resultsContainerStyle: toCssString(resultsContainerStyle()),
			resultContainerStyle: toCssString(resultContainerStyle()),
			optionSelectedStyle: toCssString(optionSelectedStyle()),
			titleStyle: toCssString(titleStyle()),
			subtitleStyle: toCssString(subtitleStyle()),
			descriptionStyle: toCssString(descriptionStyle()),
			keyboardButtonStyle: toCssString(keyboardButtonStyle()),
			emptyState: $$props.emptyState
		});
	});

	onDestroy(() => {
		unsubscribeKbdListener?.();
		unsubscribePaletteStore();
		focusLastElement();
	});

	const handleFormSubmit = (ev) => ev.preventDefault();

	{
		const children = ($$anchor) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();
					let classes;
					var div_1 = $.child(div);
					var div_2 = $.child(div_1);
					let classes_1;
					var form = $.child(div_2);
					var label = $.child(form);

					$.set_attribute(label, 'for', searchInputId);

					var div_3 = $.sibling(label, 2);
					var input = $.sibling($.child(div_3), 2);

					$.remove_input_defaults(input);

					let classes_2;

					$.set_attribute(input, 'spellcheck', false);
					$.set_attribute(input, 'id', searchInputId);
					$.bind_this(input, ($$value) => $.set(searchInputRef, $$value), () => $.get(searchInputRef));

					var node_1 = $.sibling(input, 2);

					{
						const children = ($$anchor) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(formattedEscKey)));
							$.append($$anchor, text);
						};

						KeyboardButton(node_1, {
							onKeyboardButtonClicked: () => closePalette(),
							children,
							$$slots: { default: true }
						});
					}

					$.reset(div_3);
					$.reset(form);

					var node_2 = $.sibling(form, 2);

					ResultPanel(node_2, {
						get emptyState() {
							return $$props.emptyState;
						}
					});

					$.reset(div_2);
					$.bind_this(div_2, ($$value) => $.set(commandPaletteRef, $$value), () => $.get(commandPaletteRef));
					$.reset(div_1);
					$.reset(div);
					$.bind_this(div, ($$value) => $.set(wrapperElement, $$value), () => $.get(wrapperElement));

					$.template_effect(
						($0, $1, $2) => {
							classes = $.set_class(div, 1, $.clsx(overlayClass()), 'svelte-wh9uu8', classes, { 'cp-overlay': !unstyled() });
							$.set_style(div, $0);
							classes_1 = $.set_class(div_2, 1, $.clsx(paletteWrapperInnerClass()), 'svelte-wh9uu8', classes_1, { 'cp-container': !unstyled() });
							$.set_style(div_2, $1);
							classes_2 = $.set_class(input, 1, $.clsx(inputClass()), 'svelte-wh9uu8', classes_2, { 'cp-input': !unstyled() });
							$.set_style(input, $2);
							$.set_attribute(input, 'placeholder', placeholder());
							$.set_attribute(input, 'aria-activedescendant', $.get(activeCommand) ? `palette-${$.get(activeCommand)}` : undefined);
						},
						[
							() => toCssString(overlayStyle()),
							() => toCssString(paletteWrapperInnerStyle()),
							() => toCssString(inputStyle())
						]
					);

					$.event('submit', form, handleFormSubmit);
					$.delegated('input', input, handleSearch);
					$.bind_value(input, () => $paletteStore().textInput, ($$value) => $.store_mutate(paletteStore, $.untrack($paletteStore).textInput = $$value, $.untrack($paletteStore)));
					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if ($.get(isPaletteVisible)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		Portal($$anchor, { target: 'body', children, $$slots: { default: true } });
	}

	$.pop();
	$$cleanup();
}

$.delegate(['input']);