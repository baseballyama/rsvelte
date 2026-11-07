import * as $ from 'svelte/internal/server';
import TiptapContent from '../tiptap/components/TiptapContent.svelte';
import './editor.css';
import mermaid from 'mermaid';
import { MathBlock, Link, MathInline, TableColMenu, TableRowMenu } from './components/menu/index.js';
import { mode } from 'mode-watcher';
import { cn } from '$lib/utils.js';

export default function Editor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { class: className = '' } = $$props;

		mermaid.initialize({
			startOnLoad: false,
			theme: mode.current === 'dark' ? 'dark' : 'default',
			securityLevel: 'loose',
			fontFamily: 'inherit'
		});

		Link($$renderer, {});
		$$renderer.push(`<!----> `);
		MathBlock($$renderer, {});
		$$renderer.push(`<!----> `);
		MathInline($$renderer, {});
		$$renderer.push(`<!----> `);
		TableColMenu($$renderer, {});
		$$renderer.push(`<!----> `);
		TableRowMenu($$renderer, {});
		$$renderer.push(`<!----> `);
		TiptapContent($$renderer, { class: cn('relative', className) });
		$$renderer.push(`<!---->`);
	});
}