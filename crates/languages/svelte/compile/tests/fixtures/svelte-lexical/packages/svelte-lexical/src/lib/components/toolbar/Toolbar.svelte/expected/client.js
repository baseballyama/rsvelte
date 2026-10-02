import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import StateStoreRichTextUpdator from './StateStoreRichTextUpdator.svelte';
import { setContext } from 'svelte';
import { getEditor } from '$lib/core/composerContext.js';

var root = $.from_html(`<!> <div class="toolbar"><!></div>`, 1);

export default function Toolbar($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $blockType = () => $.store_get(blockType, '$blockType', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	const activeEditor = writable(editor);

	setContext('activeEditor', activeEditor);
	setContext('isBold', writable(false));
	setContext('isItalic', writable(false));
	setContext('isUnderline', writable(false));
	setContext('isStrikethrough', writable(false));
	setContext('isSubscript', writable(false));
	setContext('isSuperscript', writable(false));
	setContext('isCode', writable(false));

	const blockType = writable('paragraph');

	setContext('blockType', blockType);
	setContext('selectedElementKey', writable(null));
	setContext('fontSize', writable('15px'));
	setContext('fontFamily', writable('Arial'));
	setContext('fontColor', writable('#000'));
	setContext('bgColor', writable('#fff'));
	setContext('isRTL', writable(false));
	setContext('codeLanguage', writable(''));
	setContext('codeTheme', writable('one-light'));
	setContext('isLink', writable(false));
	setContext('isImageCaption', writable(false));

	var fragment = root();
	var node = $.first_child(fragment);

	StateStoreRichTextUpdator(node, {});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children ?? $.noop, () => ({
		editor,
		activeEditor: $activeEditor(),
		blockType: $blockType()
	}));

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}