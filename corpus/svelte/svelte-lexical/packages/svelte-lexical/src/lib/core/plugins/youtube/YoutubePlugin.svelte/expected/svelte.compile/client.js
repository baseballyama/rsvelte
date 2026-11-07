import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { $insertNodeToNearestRoot as insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $createYouTubeNode as createYouTubeNode, YouTubeNode } from './YouTubeNode.js';
import { getEditor } from '$lib/core/composerContext.js';

export const INSERT_YOUTUBE_COMMAND = createCommand('INSERT_YOUTUBE_COMMAND');

export default function YoutubePlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	$.user_effect(() => {
		if (!editor.hasNodes([YouTubeNode])) {
			throw new Error('YouTubePlugin: YouTubeNode not registered on editor');
		}

		return editor.registerCommand(
			INSERT_YOUTUBE_COMMAND,
			(payload) => {
				const youTubeNode = createYouTubeNode(payload);

				insertNodeToNearestRoot(youTubeNode);

				return true;
			},
			COMMAND_PRIORITY_EDITOR
		);
	});

	$.pop();
}