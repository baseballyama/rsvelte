import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getEditor } from '../../../../composerContext.js';
import { CodeNode, $isCodeNode as isCodeNode } from '@lexical/code';
import { $getNearestNodeFromDOMNode as getNearestNodeFromDOMNode } from 'lexical';

import {
	loadPrettierFormat,
	loadPrettierParserByLang,
	PRETTIER_OPTIONS_BY_LANG
} from './PrettierLangOptions.js';

var root = $.from_html(`<i class="format prettier-error"></i>`);
var root_1 = $.from_html(`<i class="format prettier"></i>`);
var root_2 = $.from_html(`<pre class="code-error-tips"> </pre>`);
var root_3 = $.from_html(`<div class="prettier-wrapper"><button type="button" class="menu-item" aria-label="prettier"><!></button> <!></div>`);

export default function PrettierButton($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	function getPrettierOptions(lang) {
		const options = PRETTIER_OPTIONS_BY_LANG[lang];

		if (!options) {
			throw new Error(`CodeActionMenuPlugin: Prettier does not support this language: ${lang}`);
		}

		return options;
	}

	let syntaxError = $.state('');
	let tipsVisible = $.state(false);

	async function handleClick() {
		const codeDOMNode = $$props.getCodeDOMNode();

		if (!codeDOMNode) {
			return;
		}

		try {
			const format = await loadPrettierFormat();
			const options = getPrettierOptions($$props.lang);

			options.plugins = await loadPrettierParserByLang($$props.lang);

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
						$.set(syntaxError, '');
						$.set(tipsVisible, false);
					}
				});
			}
		} catch(error) {
			setError(error);
		}
	}

	function setError(error) {
		if (error instanceof Error) {
			$.set(syntaxError, error.message, true);
			$.set(tipsVisible, true);
		} else {
			// eslint-disable-next-line no-console
			console.error('Unexpected error: ', error);
		}
	}

	function handleMouseEnter() {
		if ($.get(syntaxError) !== '') {
			$.set(tipsVisible, true);
		}
	}

	function handleMouseLeave() {
		if ($.get(syntaxError) !== '') {
			$.set(tipsVisible, false);
		}
	}

	var div = root_3();
	var button = $.child(div);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var i = root();

			$.append($$anchor, i);
		};

		var alternate = ($$anchor) => {
			var i_1 = root_1();

			$.append($$anchor, i_1);
		};

		$.if(node, ($$render) => {
			if ($.get(syntaxError)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var pre = root_2();
			var text = $.only_child(pre, true);

			$.template_effect(() => $.set_text(text, $.get(syntaxError)));
			$.append($$anchor, pre);
		};

		$.if(node_1, ($$render) => {
			if ($.get(tipsVisible)) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.delegated('click', button, handleClick);
	$.event('mouseenter', button, handleMouseEnter);
	$.event('mouseleave', button, handleMouseLeave);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);