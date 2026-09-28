import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	addClassNamesToElement,
	mergeRegister,
	removeClassNamesFromElement
} from '@lexical/utils';

import { CLICK_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { onMount } from 'svelte';
import { clearSelection, createNodeSelectionStore } from '../nodeSelectionStore.js';

export default function HorizontalRuleComponent($$anchor, $$props) {
	$.push($$props, true);

	const $isSelected = () => $.store_get(isSelected, '$isSelected', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isSelected = createNodeSelectionStore($$props.editor, $$props.nodeKey);
	const isSelectedClassName = $$props.editor._config.theme.hrSelected ?? 'selected';

	$.user_effect(() => {
		if ($isSelected()) {
			addClassNamesToElement($$props.self, isSelectedClassName);
		} else {
			removeClassNamesFromElement($$props.self, isSelectedClassName);
		}
	});

	onMount(() => {
		return mergeRegister($$props.editor.registerCommand(
			CLICK_COMMAND,
			(event) => {
				if (event.target === $$props.self) {
					if (!event.shiftKey) {
						clearSelection($$props.editor);
					}

					$.store_set(isSelected, !$isSelected());

					return true;
				}

				return false;
			},
			COMMAND_PRIORITY_LOW
		));
	});

	$.pop();
	$$cleanup();
}