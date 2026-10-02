import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { $isCodeNode as isCodeNode } from '@lexical/code';

import {
	$getNearestNodeFromDOMNode as getNearestNodeFromDOMNode,
	$getSelection as getSelection,
	$setSelection as setSelection
} from 'lexical';

import { getEditor } from '../../../../composerContext.js';
import { useDebounce } from '../utils.js';

var root = $.from_html(`<i class="format success"></i>`);
var root_1 = $.from_html(`<i class="format copy"></i>`);
var root_2 = $.from_html(`<button type="button" class="menu-item" aria-label="copy"><!></button>`);

export default function CopyButton($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	let isCopyCompleted = $.state(false);

	const removeSuccessIcon = useDebounce(
		() => {
			$.set(isCopyCompleted, false);
		},
		1000
	);

	async function handleClick() {
		const codeDOMNode = $$props.getCodeDOMNode();

		if (!codeDOMNode) {
			return;
		}

		let content = '';

		editor.update(() => {
			const codeNode = getNearestNodeFromDOMNode(codeDOMNode);

			if (isCodeNode(codeNode)) {
				content = codeNode.getTextContent();
			}

			const selection = getSelection();

			setSelection(selection);
		});

		try {
			await navigator.clipboard.writeText(content);
			$.set(isCopyCompleted, true);
			removeSuccessIcon();
		} catch(err) {
			// eslint-disable-next-line no-console
			console.error('Failed to copy: ', err);
		}
	}

	var button = root_2();
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
			if ($.get(isCopyCompleted)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.delegated('click', button, handleClick);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);