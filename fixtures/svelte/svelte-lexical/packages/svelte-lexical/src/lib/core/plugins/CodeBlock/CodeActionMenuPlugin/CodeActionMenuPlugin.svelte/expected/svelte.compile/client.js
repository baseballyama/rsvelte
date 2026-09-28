import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div class="code-action-menu-container"><div class="code-highlight-language"> </div> <!> <!></div>`);

export default function CodeActionMenuPlugin($$anchor, $$props) {
	$.push($$props, true);

	const CODE_PADDING = 8;

	// this component is supposed to be appended to `anchorElem` as per lexical but positioning works without it
	let anchorElem = $.prop($$props, 'anchorElem', 19, () => document.body);

	const editor = getEditor();
	let lang = $.state('');
	let isShown = $.state(false);
	let shouldListenMouseMove = $.state(false);
	let position = $.state($.proxy({ right: '0', top: '0' }));
	const codeSetRef = new Set();
	let codeDOMNodeRef = null;

	function getCodeDOMNode() {
		return codeDOMNodeRef;
	}

	const debouncedOnMouseMove = useDebounce(
		(event) => {
			const { codeDOMNode, isOutside } = getMouseInfo(event);

			if (isOutside) {
				$.set(isShown, false);

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
				const { y: editorElemY, right: editorElemRight } = anchorElem().getBoundingClientRect();
				const { y, right } = codeDOMNode.getBoundingClientRect();

				$.set(lang, _lang, true);
				$.set(isShown, true);

				$.set(
					position,
					{
						right: `${editorElemRight - right + CODE_PADDING}px`,
						top: `${y - editorElemY}px`
					},
					true
				);
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

				$.set(shouldListenMouseMove, codeSetRef.size > 0);
			},
			{ skipInitialization: false }
		);
	});

	$.user_effect(() => {
		if (!$.get(shouldListenMouseMove)) {
			$.set(isShown, false);
			debouncedOnMouseMove.cancel();
			document.removeEventListener('mousemove', debouncedOnMouseMove);

			return;
		}

		document.addEventListener('mousemove', debouncedOnMouseMove);

		return () => document.removeEventListener('mousemove', debouncedOnMouseMove);
	});

	let normalizedLang = $.derived(() => normalizeCodeLang($.get(lang)));
	let codeFriendlyName = $.derived(() => getLanguageFriendlyName($.get(lang)));

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var text = $.only_child(div_1, true);
			var node_1 = $.sibling(div_1, 2);

			CopyButton(node_1, { getCodeDOMNode });

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					PrettierButton($$anchor, {
						getCodeDOMNode,
						get lang() {
							return $.get(normalizedLang);
						}
					});
				};

				var d = $.derived(() => canBePrettier($.get(normalizedLang)));

				$.if(node_2, ($$render) => {
					if ($.get(d)) $$render(consequent);
				});
			}

			$.reset(div);

			$.template_effect(() => {
				$.set_style(div, `right:${$.get(position).right ?? ''};top:${$.get(position).top ?? ''};`);
				$.set_text(text, $.get(codeFriendlyName));
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(isShown)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}