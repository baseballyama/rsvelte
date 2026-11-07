import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { generateHtmlFromNodes } from '$lib/index.js';
import Composer from '$lib/core/Composer.svelte';
import { onMount } from 'svelte';
import RichTextComposer from './RichTextComposer.svelte';

var root = $.from_html(`<!> <div class="html-output svelte-1sg8n9f"><h2>HTML Output</h2> <!></div> <div class="html-output svelte-1sg8n9f"><h2>HTML Code</h2> </div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let composer;
	let html = $.state('');

	onMount(() => {
		const editor = composer.getEditor();

		editor.registerUpdateListener(() => {
			editor.getEditorState().read(() => {
				$.set(html, generateHtmlFromNodes(editor), true);
			});
		});
	});

	var fragment = root();
	var node = $.first_child(fragment);

	RichTextComposer(node, {
		get composer() {
			return composer;
		},

		set composer($$value) {
			composer = $$value;
		}
	});

	var div = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div), 2);

	$.html(node_1, () => $.get(html));
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var text = $.sibling($.child(div_1));

	$.reset(div_1);
	$.template_effect(() => $.set_text(text, ` ${$.get(html) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}