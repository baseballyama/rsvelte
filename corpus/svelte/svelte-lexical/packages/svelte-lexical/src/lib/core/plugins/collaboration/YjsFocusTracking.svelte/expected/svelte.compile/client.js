import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeRegister } from '@lexical/utils';
import { setLocalStateFocus } from '@lexical/yjs';
import { BLUR_COMMAND, COMMAND_PRIORITY_EDITOR, FOCUS_COMMAND } from 'lexical';
import { onMount } from 'svelte';

export default function YjsFocusTracking($$anchor, $$props) {
	$.push($$props, true);

	let awarenessData = $.prop($$props, 'awarenessData', 3, undefined);

	onMount(() => {
		return mergeRegister(
			$$props.editor.registerCommand(
				FOCUS_COMMAND,
				() => {
					setLocalStateFocus($$props.provider, $$props.name, $$props.color, true, awarenessData() || {});

					return false;
				},
				COMMAND_PRIORITY_EDITOR
			),
			$$props.editor.registerCommand(
				BLUR_COMMAND,
				() => {
					setLocalStateFocus($$props.provider, $$props.name, $$props.color, false, awarenessData() || {});

					return false;
				},
				COMMAND_PRIORITY_EDITOR
			)
		);
	});

	$.pop();
}