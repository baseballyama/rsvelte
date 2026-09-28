import * as $ from 'svelte/internal/server';

import {
	$isCodeNode as isCodeNode,
	CodeNode,
	getLanguageFriendlyName,
	normalizeCodeLang
} from '@lexical/code';

import {
	$getNearestNodeFromDOMNode as getNearestNodeFromDOMNode,
	isHTMLElement
} from 'lexical';

import { onMount } from 'svelte';
import { getEditor } from '../../../composerContext.js';
import CopyButton from './components/CopyButton.svelte';
import PrettierButton from './components/PrettierButton.svelte';
import { canBePrettier } from './components/PrettierLangOptions.js';
import { useDebounce } from './utils.js';

export default function CodeActionMenuPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const CODE_PADDING = 8;

		// this component is supposed to be appended to `anchorElem` as per lexical but positioning works without it
		let { anchorElem = document.body } = $$props;

		const editor = getEditor();
		let lang = '';
		let isShown = false;
		let shouldListenMouseMove = false;
		let position = { right: '0', top: '0' };
		const codeSetRef = new Set();
		let codeDOMNodeRef = null;

		function getCodeDOMNode() {
			return codeDOMNodeRef;
		}

		const debouncedOnMouseMove = useDebounce(
			(event) => {
				const { codeDOMNode, isOutside } = getMouseInfo(event);

				if (isOutside) {
					isShown = false;

					return;
				}

				if (!codeDOMNode) {
					return;
				}

				codeDOMNodeRef = codeDOMNode;

				let codeNode = null;
				let _lang = '';

				editor.update(() => {
					const maybeCodeNode = getNearestNodeFromDOMNode(codeDOMNode);

					if (isCodeNode(maybeCodeNode)) {
						codeNode = maybeCodeNode;
						_lang = codeNode.getLanguage() || '';
					}
				});

				if (codeNode) {
					const { y: editorElemY, right: editorElemRight } = anchorElem.getBoundingClientRect();
					const { y, right } = codeDOMNode.getBoundingClientRect();

					lang = _lang;
					isShown = true;

					position = {
						right: `${editorElemRight - right + CODE_PADDING}px`,
						top: `${y - editorElemY}px`
					};
				}
			},
			50,
			1000
		);

		onMount(() => {
			return editor.registerMutationListener(
				CodeNode,
				(mutations) => {
					editor.getEditorState().read(() => {
						for (const [key, type] of mutations) {
							switch (type) {
								case 'created':
									codeSetRef.add(key);
									break;

								case 'destroyed':
									codeSetRef.delete(key);
									break;

								default:
									break;
							}
						}
					});

					shouldListenMouseMove = codeSetRef.size > 0;
				},
				{ skipInitialization: false }
			);
		});

		let normalizedLang = $.derived(() => normalizeCodeLang(lang));
		let codeFriendlyName = $.derived(() => getLanguageFriendlyName(lang));

		function getMouseInfo(event) {
			const target = event.target;

			if (isHTMLElement(target)) {
				const codeDOMNode = target.closest('code');
				const isOutside = !(codeDOMNode || target.closest('div.code-action-menu-container'));

				return { codeDOMNode, isOutside };
			} else {
				return { codeDOMNode: null, isOutside: true };
			}
		}

		if (isShown) {
			$$renderer.push(`<!--[0--><div class="code-action-menu-container"${$.attr_style(`right:${$.stringify(position.right)};top:${$.stringify(position.top)};`)}><div class="code-highlight-language">${$.escape(codeFriendlyName())}</div> `);
			CopyButton($$renderer, { getCodeDOMNode });
			$$renderer.push(`<!----> `);

			if (canBePrettier(normalizedLang())) {
				$$renderer.push('<!--[0-->');
				PrettierButton($$renderer, { getCodeDOMNode, lang: normalizedLang() });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}