import * as $ from 'svelte/internal/server';

import {
	COMMAND_PRIORITY_LOW,
	KEY_ARROW_DOWN_COMMAND,
	KEY_ARROW_UP_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	KEY_TAB_COMMAND,
	TextNode
} from 'lexical';

import {
	$splitNodeContainingQuery as splitNodeContainingQuery,
	MenuOption,
	scrollIntoViewIfNeeded
} from './contextMenuHelpers.js';

import { mergeRegister } from '@lexical/utils';
import { SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND } from './typeAheadMenuHelpers.js';
import { onMount } from 'svelte';

export default function ContextMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			close,
			editor,
			anchorElementRef,
			resolution,
			options,
			menuRenderFn,
			onSelectOption,
			shouldSplitNodeWithQuery = false,
			commandPriority = COMMAND_PRIORITY_LOW,
			preselectFirstItem = true
		} = $$props;

		const selectedIndex = { value: null };

		// TODO: this is a $effect dependency. Test if it is reactive.
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const selectOptionAndCleanUp = (selectedEntry) => {
			editor.update(() => {
				const textNodeContainingQuery = resolution.value.match != null && shouldSplitNodeWithQuery
					? splitNodeContainingQuery(resolution.value.match)
					: null;

				onSelectOption(selectedEntry, textNodeContainingQuery, close, resolution.value.match ? resolution.value.match.matchingString : '');
			});
		};

		const updateSelectedIndex = (index) => {
			const rootElem = editor.getRootElement();

			if (rootElem !== null) {
				rootElem.setAttribute('aria-activedescendant', 'typeahead-item-' + index);
				selectedIndex.value = index;
			}
		};

		onMount(() => {
			return mergeRegister(
				mergeRegister(editor.registerCommand(
					SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND,
					({ option }) => {
						if (option.ref && option.ref != null) {
							scrollIntoViewIfNeeded(option.ref);

							return true;
						}

						return false;
					},
					commandPriority
				)),
				editor.registerCommand(
					KEY_ARROW_DOWN_COMMAND,
					(payload) => {
						const event = payload;

						if (options !== null && options.length) {
							const newSelectedIndex = selectedIndex.value === null
								? 0
								: selectedIndex.value !== options.length - 1 ? selectedIndex.value + 1 : 0;

							updateSelectedIndex(newSelectedIndex);

							const option = options[newSelectedIndex];

							if (option.ref != null && option.ref) {
								editor.dispatchCommand(SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND, { index: newSelectedIndex, option });
							}

							event.preventDefault();
							event.stopImmediatePropagation();
						}

						return true;
					},
					commandPriority
				),
				editor.registerCommand(
					KEY_ARROW_UP_COMMAND,
					(payload) => {
						const event = payload;

						if (options !== null && options.length) {
							const newSelectedIndex = selectedIndex.value === null
								? options.length - 1
								: selectedIndex.value !== 0 ? selectedIndex.value - 1 : options.length - 1;

							updateSelectedIndex(newSelectedIndex);

							const option = options[newSelectedIndex];

							if (option.ref != null && option.ref) {
								scrollIntoViewIfNeeded(option.ref);
							}

							event.preventDefault();
							event.stopImmediatePropagation();
						}

						return true;
					},
					commandPriority
				),
				editor.registerCommand(
					KEY_ESCAPE_COMMAND,
					(payload) => {
						const event = payload;

						event.preventDefault();
						event.stopImmediatePropagation();
						close();

						return true;
					},
					commandPriority
				),
				editor.registerCommand(
					KEY_TAB_COMMAND,
					(payload) => {
						const event = payload;

						if (options === null || selectedIndex.value === null || options[selectedIndex.value] == null) {
							return false;
						}

						event.preventDefault();
						event.stopImmediatePropagation();
						selectOptionAndCleanUp(options[selectedIndex.value]);

						return true;
					},
					commandPriority
				),
				editor.registerCommand(
					KEY_ENTER_COMMAND,
					(event) => {
						if (options === null || selectedIndex.value === null || options[selectedIndex.value] == null) {
							return false;
						}

						if (event !== null) {
							event.preventDefault();
							event.stopImmediatePropagation();
						}

						selectOptionAndCleanUp(options[selectedIndex.value]);

						return true;
					},
					commandPriority
				)
			);
		});

		menuRenderFn($$renderer, anchorElementRef, { options, selectOptionAndCleanUp, selectedIndex }, resolution.value.match ? resolution.value.match.matchingString : '');
		$$renderer.push(`<!---->`);
	});
}