import * as $ from 'svelte/internal/server';
import { $isCodeNode as isCodeNode } from '@lexical/code';

import {
	$getNearestNodeFromDOMNode as getNearestNodeFromDOMNode,
	$getSelection as getSelection,
	$setSelection as setSelection
} from 'lexical';

import { getEditor } from '../../../../composerContext.js';
import { useDebounce } from '../utils.js';

export default function CopyButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
		let { getCodeDOMNode } = $$props;
		let isCopyCompleted = false;

		const removeSuccessIcon = useDebounce(
			() => {
				isCopyCompleted = false;
			},
			1000
		);

		async function handleClick() {
			const codeDOMNode = getCodeDOMNode();

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
				isCopyCompleted = true;
				removeSuccessIcon();
			} catch(err) {
				// eslint-disable-next-line no-console
				console.error('Failed to copy: ', err);
			}
		}

		$$renderer.push(`<button type="button" class="menu-item" aria-label="copy">`);

		if (isCopyCompleted) {
			$$renderer.push(`<!--[0--><i class="format success"></i>`);
		} else {
			$$renderer.push(`<!--[-1--><i class="format copy"></i>`);
		}

		$$renderer.push(`<!--]--></button>`);
	});
}