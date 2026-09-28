import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

export default function ContextMenu($$anchor, $$props) {
	$.push($$props, true);

	let shouldSplitNodeWithQuery = $.prop($$props, 'shouldSplitNodeWithQuery', 3, false),
		commandPriority = $.prop($$props, 'commandPriority', 3, COMMAND_PRIORITY_LOW),
		preselectFirstItem = $.prop($$props, 'preselectFirstItem', 3, true);

	const selectedIndex = $.proxy({ value: null });

	$.user_effect(() => {
		// TODO: this is a $effect dependency. Test if it is reactive.
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const matchingString = $$props.resolution.value.match && $$props.resolution.value.match.matchingString;

		if (preselectFirstItem()) {
			selectedIndex.value = 0;
		}
	});

	const selectOptionAndCleanUp = (selectedEntry) => {
		$$props.editor.update(() => {
			const textNodeContainingQuery = $$props.resolution.value.match != null && shouldSplitNodeWithQuery()
				? splitNodeContainingQuery($$props.resolution.value.match)
				: null;

			$$props.onSelectOption(selectedEntry, textNodeContainingQuery, $$props.close, $$props.resolution.value.match ? $$props.resolution.value.match.matchingString : '');
		});
	};

	const updateSelectedIndex = (index) => {
		const rootElem = $$props.editor.getRootElement();

		if (rootElem !== null) {
			rootElem.setAttribute('aria-activedescendant', 'typeahead-item-' + index);
			selectedIndex.value = index;
		}
	};

	$.user_effect(() => {
		return () => {
			const rootElem = $$props.editor.getRootElement();

			if (rootElem !== null) {
				rootElem.removeAttribute('aria-activedescendant');
			}
		};
	});

	$.user_pre_effect(() => {
		if ($$props.options === null) {
			selectedIndex.value = null;
		} else if (selectedIndex.value === null && preselectFirstItem()) {
			updateSelectedIndex(0);
		}
	});

	onMount(() => {
		return mergeRegister(
			mergeRegister($$props.editor.registerCommand(
				SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND,
				({ option }) => {
					if (option.ref && option.ref != null) {
						scrollIntoViewIfNeeded(option.ref);

						return true;
					}

					return false;
				},
				commandPriority()
			)),
			$$props.editor.registerCommand(
				KEY_ARROW_DOWN_COMMAND,
				(payload) => {
					const event = payload;

					if ($$props.options !== null && $$props.options.length) {
						const newSelectedIndex = selectedIndex.value === null
							? 0
							: selectedIndex.value !== $$props.options.length - 1 ? selectedIndex.value + 1 : 0;

						updateSelectedIndex(newSelectedIndex);

						const option = $$props.options[newSelectedIndex];

						if (option.ref != null && option.ref) {
							$$props.editor.dispatchCommand(SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND, { index: newSelectedIndex, option });
						}

						event.preventDefault();
						event.stopImmediatePropagation();
					}

					return true;
				},
				commandPriority()
			),
			$$props.editor.registerCommand(
				KEY_ARROW_UP_COMMAND,
				(payload) => {
					const event = payload;

					if ($$props.options !== null && $$props.options.length) {
						const newSelectedIndex = selectedIndex.value === null
							? $$props.options.length - 1
							: selectedIndex.value !== 0 ? selectedIndex.value - 1 : $$props.options.length - 1;

						updateSelectedIndex(newSelectedIndex);

						const option = $$props.options[newSelectedIndex];

						if (option.ref != null && option.ref) {
							scrollIntoViewIfNeeded(option.ref);
						}

						event.preventDefault();
						event.stopImmediatePropagation();
					}

					return true;
				},
				commandPriority()
			),
			$$props.editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				(payload) => {
					const event = payload;

					event.preventDefault();
					event.stopImmediatePropagation();
					$$props.close();

					return true;
				},
				commandPriority()
			),
			$$props.editor.registerCommand(
				KEY_TAB_COMMAND,
				(payload) => {
					const event = payload;

					if ($$props.options === null || selectedIndex.value === null || $$props.options[selectedIndex.value] == null) {
						return false;
					}

					event.preventDefault();
					event.stopImmediatePropagation();
					selectOptionAndCleanUp($$props.options[selectedIndex.value]);

					return true;
				},
				commandPriority()
			),
			$$props.editor.registerCommand(
				KEY_ENTER_COMMAND,
				(event) => {
					if ($$props.options === null || selectedIndex.value === null || $$props.options[selectedIndex.value] == null) {
						return false;
					}

					if (event !== null) {
						event.preventDefault();
						event.stopImmediatePropagation();
					}

					selectOptionAndCleanUp($$props.options[selectedIndex.value]);

					return true;
				},
				commandPriority()
			)
		);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(
		node,
		() => $$props.menuRenderFn,
		() => $$props.anchorElementRef,
		() => ({
			options: $$props.options,
			selectOptionAndCleanUp,
			selectedIndex
		}),
		() => $$props.resolution.value.match ? $$props.resolution.value.match.matchingString : ''
	);

	$.append($$anchor, fragment);
	$.pop();
}