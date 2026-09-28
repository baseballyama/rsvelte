import * as $ from 'svelte/internal/server';
import { getEditor } from '../../../../composerContext.js';
import { CodeNode, $isCodeNode as isCodeNode } from '@lexical/code';
import { $getNearestNodeFromDOMNode as getNearestNodeFromDOMNode } from 'lexical';

import {
	loadPrettierFormat,
	loadPrettierParserByLang,
	PRETTIER_OPTIONS_BY_LANG
} from './PrettierLangOptions.js';

export default function PrettierButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
		let { lang, getCodeDOMNode } = $$props;

		function getPrettierOptions(lang) {
			const options = PRETTIER_OPTIONS_BY_LANG[lang];

			if (!options) {
				throw new Error(`CodeActionMenuPlugin: Prettier does not support this language: ${lang}`);
			}

			return options;
		}

		let syntaxError = '';
		let tipsVisible = false;

		async function handleClick() {
			const codeDOMNode = getCodeDOMNode();

			if (!codeDOMNode) {
				return;
			}

			try {
				const format = await loadPrettierFormat();
				const options = getPrettierOptions(lang);

				options.plugins = await loadPrettierParserByLang(lang);

				let codeNode;
				let content = '';

				editor.update(() => {
					codeNode = getNearestNodeFromDOMNode(codeDOMNode);

					if (isCodeNode(codeNode)) {
						content = codeNode.getTextContent();
					}
				});

				if (content) {
					let parsed = '';

					parsed = await format(content, options);

					editor.update(() => {
						if (parsed !== '') {
							const selection = codeNode.select(0);

							selection.insertText(parsed);
							syntaxError = '';
							tipsVisible = false;
						}
					});
				}
			} catch(error) {
				setError(error);
			}
		}

		function setError(error) {
			if (error instanceof Error) {
				syntaxError = error.message;
				tipsVisible = true;
			} else {
				// eslint-disable-next-line no-console
				console.error('Unexpected error: ', error);
			}
		}

		function handleMouseEnter() {
			if (syntaxError !== '') {
				tipsVisible = true;
			}
		}

		function handleMouseLeave() {
			if (syntaxError !== '') {
				tipsVisible = false;
			}
		}

		$$renderer.push(`<div class="prettier-wrapper"><button type="button" class="menu-item" aria-label="prettier">`);

		if (syntaxError) {
			$$renderer.push(`<!--[0--><i class="format prettier-error"></i>`);
		} else {
			$$renderer.push(`<!--[-1--><i class="format prettier"></i>`);
		}

		$$renderer.push(`<!--]--></button> `);

		if (tipsVisible) {
			$$renderer.push(`<!--[0--><pre class="code-error-tips">${$.escape(syntaxError)}</pre>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}