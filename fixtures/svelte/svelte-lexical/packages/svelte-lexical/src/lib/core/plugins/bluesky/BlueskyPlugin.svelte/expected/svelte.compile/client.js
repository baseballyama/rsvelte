import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { $insertNodeToNearestRoot as insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $createBlueskyNode as createBlueskyNode, BlueskyNode } from './BlueskyNode.js';
import { getEditor } from '$lib/core/composerContext.js';

export const INSERT_BLUESKY_COMMAND = createCommand('INSERT_BLUESKY_COMMAND');

export default function BlueskyPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	$.user_effect(() => {
		if (!editor.hasNodes([BlueskyNode])) {
			throw new Error('BlueskyPlugin: BlueskyNode not registered on editor');
		}

		return editor.registerCommand(
			INSERT_BLUESKY_COMMAND,
			({ profile, postKey }) => {
				const blueskyNode = createBlueskyNode(profile, postKey);

				insertNodeToNearestRoot(blueskyNode);

				return true;
			},
			COMMAND_PRIORITY_EDITOR
		);
	});

	$.pop();
}