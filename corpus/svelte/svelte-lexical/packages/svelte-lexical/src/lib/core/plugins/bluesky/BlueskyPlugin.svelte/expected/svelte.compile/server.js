import * as $ from 'svelte/internal/server';
import { $insertNodeToNearestRoot as insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $createBlueskyNode as createBlueskyNode, BlueskyNode } from './BlueskyNode.js';
import { getEditor } from '$lib/core/composerContext.js';

export const INSERT_BLUESKY_COMMAND = createCommand('INSERT_BLUESKY_COMMAND');

export default function BlueskyPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
	});
}