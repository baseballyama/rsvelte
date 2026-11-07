import * as $ from 'svelte/internal/server';
import { $insertNodeToNearestRoot as insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $createTweetNode as createTweetNode, TweetNode } from './TweetNode.js';
import { getEditor } from '$lib/core/composerContext.js';

export const INSERT_TWEET_COMMAND = createCommand('INSERT_TWEET_COMMAND');

export default function TwitterPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
	});
}