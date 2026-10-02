import * as $ from 'svelte/internal/server';
import { $createKeywordNode as createKeywordNode, KeywordNode } from './KeywordNode.js';
import { getEditor } from '../composerContext.js';
import { mergeRegister } from '@lexical/utils';
import { registerLexicalTextEntity } from '@lexical/text';
import { onMount } from 'svelte';

export default function KeywordPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { keywordsRegex } = $$props;
		const editor = getEditor();

		if (!editor.hasNodes([KeywordNode])) {
			throw new Error('KeywordsPlugin: KeywordNode not registered on editor');
		}

		onMount(() => {
			return mergeRegister(...registerLexicalTextEntity(editor, getKeywordMatch, KeywordNode, createKeywordNodeFromTextNode));
		});

		function createKeywordNodeFromTextNode(textNode) {
			return createKeywordNode(textNode.getTextContent());
		}

		function getKeywordMatch(text) {
			const matchArr = keywordsRegex.exec(text);

			if (matchArr === null) {
				return null;
			}

			const hashtagLength = matchArr[2].length;
			const startOffset = matchArr.index + matchArr[1].length;
			const endOffset = startOffset + hashtagLength;

			return { end: endOffset, start: startOffset };
		}
	});
}