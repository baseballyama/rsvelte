import * as $ from 'svelte/internal/server';
import { $insertNodeToNearestRoot as insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $createYouTubeNode as createYouTubeNode, YouTubeNode } from './YouTubeNode.js';
import { getEditor } from '$lib/core/composerContext.js';

export const INSERT_YOUTUBE_COMMAND = createCommand('INSERT_YOUTUBE_COMMAND');

export default function YoutubePlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
	});
}