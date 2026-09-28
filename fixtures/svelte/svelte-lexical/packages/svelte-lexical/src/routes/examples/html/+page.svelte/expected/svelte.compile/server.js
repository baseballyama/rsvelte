import * as $ from 'svelte/internal/server';
import { generateHtmlFromNodes } from '$lib/index.js';
import Composer from '$lib/core/Composer.svelte';
import { onMount } from 'svelte';
import RichTextComposer from './RichTextComposer.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let composer;
		let html = '';

		onMount(() => {
			const editor = composer.getEditor();

			editor.registerUpdateListener(() => {
				editor.getEditorState().read(() => {
					html = generateHtmlFromNodes(editor);
				});
			});
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			RichTextComposer($$renderer, {
				get composer() {
					return composer;
				},

				set composer($$value) {
					composer = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="html-output svelte-1sg8n9f"><h2>HTML Output</h2> ${$.html(html)}</div> <div class="html-output svelte-1sg8n9f"><h2>HTML Code</h2> ${$.escape(html)}</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}