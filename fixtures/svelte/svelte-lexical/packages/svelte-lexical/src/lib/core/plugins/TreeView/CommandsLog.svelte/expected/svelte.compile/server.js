import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { getEditor } from '../../composerContext.js';
import { COMMAND_PRIORITY_HIGH } from 'lexical';

export default function CommandsLog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
		let { loggedCommands = [] } = $$props;

		onMount(() => {
			const unregisterCommandListeners = new Set();
			let i = 0;

			for (const [command] of editor._commands) {
				unregisterCommandListeners.add(editor.registerCommand(
					command,
					(payload) => {
						i += 1;

						const entry = {
							index: i,
							payload,
							type: command.type ? command.type : 'UNKNOWN'
						};

						queueMicrotask(() => {
							const newState = [...loggedCommands, entry];

							if (newState.length > 10) {
								newState.shift();
							}

							loggedCommands = newState;
						});

						return false;
					},
					COMMAND_PRIORITY_HIGH
				));
			}

			return () => unregisterCommandListeners.forEach((unregister) => unregister());
		});

		$.bind_props($$props, { loggedCommands });
	});
}