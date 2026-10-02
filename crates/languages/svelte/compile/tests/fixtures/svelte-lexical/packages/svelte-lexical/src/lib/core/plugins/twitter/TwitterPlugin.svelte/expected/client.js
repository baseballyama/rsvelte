import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { $insertNodeToNearestRoot as insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $createTweetNode as createTweetNode, TweetNode } from './TweetNode.js';
import { getEditor } from '$lib/core/composerContext.js';

export const INSERT_TWEET_COMMAND = createCommand('INSERT_TWEET_COMMAND');

export default function TwitterPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	$.user_effect(() => {
		if (!editor.hasNodes([TweetNode])) {
			throw new Error('TwitterPlugin: TweetNode not registered on editor');
		}

		return editor.registerCommand(
			INSERT_TWEET_COMMAND,
			(payload) => {
				const tweetNode = createTweetNode(payload);

				insertNodeToNearestRoot(tweetNode);

				return true;
			},
			COMMAND_PRIORITY_EDITOR
		);
	});

	$.pop();
}