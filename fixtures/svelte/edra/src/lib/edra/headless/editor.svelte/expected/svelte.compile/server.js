import * as $ from 'svelte/internal/server';
import TiptapContent from '../tiptap/components/TiptapContent.svelte';
import './editor.css';
import mermaid from 'mermaid';
import { MathBlock, Link, MathInline, TableColMenu, TableRowMenu } from './components/menu/index.js';
import { mode } from 'mode-watcher';

export default function Editor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { class: className = '' } = $$props;

		Link($$renderer, {});
		$$renderer.push(`<!----> `);
		MathBlock($$renderer, {});
		$$renderer.push(`<!----> `);
		MathInline($$renderer, {});
		$$renderer.push(`<!----> `);
		TableColMenu($$renderer, {});
		$$renderer.push(`<!----> `);
		TableRowMenu($$renderer, {});
		$$renderer.push(`<!----> <div class="edra-editor-root">`);
		TiptapContent($$renderer, { class: className });
		$$renderer.push(`<!----></div>`);
	});
}