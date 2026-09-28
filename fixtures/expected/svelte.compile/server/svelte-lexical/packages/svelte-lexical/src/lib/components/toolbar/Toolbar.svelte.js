import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import StateStoreRichTextUpdator from './StateStoreRichTextUpdator.svelte';
import { setContext } from 'svelte';
import { getEditor } from '$lib/core/composerContext.js';

export default function Toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
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
		StateStoreRichTextUpdator($$renderer, {});
		$$renderer.push(`<!----> <div class="toolbar">`);

		children?.($$renderer, {
			editor,
			activeEditor: $.store_get($$store_subs ??= {}, '$activeEditor', activeEditor),
			blockType: $.store_get($$store_subs ??= {}, '$blockType', blockType)
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}