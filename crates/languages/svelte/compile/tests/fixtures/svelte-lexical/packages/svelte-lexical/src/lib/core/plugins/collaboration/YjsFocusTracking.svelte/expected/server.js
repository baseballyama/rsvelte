import * as $ from 'svelte/internal/server';
import { mergeRegister } from '@lexical/utils';
import { setLocalStateFocus } from '@lexical/yjs';
import { BLUR_COMMAND, COMMAND_PRIORITY_EDITOR, FOCUS_COMMAND } from 'lexical';
import { onMount } from 'svelte';

export default function YjsFocusTracking($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, provider, name, color, awarenessData = undefined } = $$props;

		onMount(() => {
			return mergeRegister(
				editor.registerCommand(
					FOCUS_COMMAND,
					() => {
						setLocalStateFocus(provider, name, color, true, awarenessData || {});

						return false;
					},
					COMMAND_PRIORITY_EDITOR
				),
				editor.registerCommand(
					BLUR_COMMAND,
					() => {
						setLocalStateFocus(provider, name, color, false, awarenessData || {});

						return false;
					},
					COMMAND_PRIORITY_EDITOR
				)
			);
		});
	});
}