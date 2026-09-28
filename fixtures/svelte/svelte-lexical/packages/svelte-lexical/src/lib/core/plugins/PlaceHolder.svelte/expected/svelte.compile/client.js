import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { $canShowPlaceholderCurry as canShowPlaceholderCurry } from '@lexical/text';
import { getEditor } from '../composerContext.js';
import { onMount } from 'svelte';
import { mergeRegister } from '@lexical/utils';

var root = $.from_html(`<div><!></div>`);

export default function PlaceHolder($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'className', 3, 'Placeholder__root');
	const editor = getEditor();
	let canShowPlaceHolder = $.state(true);

	onMount(() => {
		return mergeRegister(
			editor.registerUpdateListener(() => {
				$.set(canShowPlaceHolder, canShowPlaceholderFromCurrentEditorState(editor), true);
			}),
			editor.registerEditableListener(() => {
				$.set(canShowPlaceHolder, canShowPlaceholderFromCurrentEditorState(editor), true);
			})
		);
	});

	function canShowPlaceholderFromCurrentEditorState(editor) {
		const currentCanShowPlaceholder = editor.getEditorState().read(canShowPlaceholderCurry(editor.isComposing()));

		return currentCanShowPlaceholder;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div);
			$.template_effect(() => $.set_class(div, 1, $.clsx(className()), 'svelte-2g746g'));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(canShowPlaceHolder)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}