import * as $ from 'svelte/internal/server';
import { $canShowPlaceholderCurry as canShowPlaceholderCurry } from '@lexical/text';
import { getEditor } from '../composerContext.js';
import { onMount } from 'svelte';
import { mergeRegister } from '@lexical/utils';

export default function PlaceHolder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { className = 'Placeholder__root', children } = $$props;
		const editor = getEditor();
		let canShowPlaceHolder = true;

		onMount(() => {
			return mergeRegister(
				editor.registerUpdateListener(() => {
					canShowPlaceHolder = canShowPlaceholderFromCurrentEditorState(editor);
				}),
				editor.registerEditableListener(() => {
					canShowPlaceHolder = canShowPlaceholderFromCurrentEditorState(editor);
				})
			);
		});

		function canShowPlaceholderFromCurrentEditorState(editor) {
			const currentCanShowPlaceholder = editor.getEditorState().read(canShowPlaceholderCurry(editor.isComposing()));

			return currentCanShowPlaceholder;
		}

		if (canShowPlaceHolder) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(className), 'svelte-2g746g')}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}