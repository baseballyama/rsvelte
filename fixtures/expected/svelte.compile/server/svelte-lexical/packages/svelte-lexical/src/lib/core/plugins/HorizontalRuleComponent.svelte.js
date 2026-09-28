import * as $ from 'svelte/internal/server';

import {
	addClassNamesToElement,
	mergeRegister,
	removeClassNamesFromElement
} from '@lexical/utils';

import { CLICK_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { onMount } from 'svelte';
import { clearSelection, createNodeSelectionStore } from '../nodeSelectionStore.js';

export default function HorizontalRuleComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { editor, nodeKey, self } = $$props;
		let isSelected = createNodeSelectionStore(editor, nodeKey);
		const isSelectedClassName = editor._config.theme.hrSelected ?? 'selected';

		onMount(() => {
			return mergeRegister(editor.registerCommand(
				CLICK_COMMAND,
				(event) => {
					if (event.target === self) {
						if (!event.shiftKey) {
							clearSelection(editor);
						}

						$.store_set(isSelected, !$.store_get($$store_subs ??= {}, '$isSelected', isSelected));

						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			));
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}