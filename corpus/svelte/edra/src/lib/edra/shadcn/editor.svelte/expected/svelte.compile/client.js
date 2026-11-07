import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TiptapContent from '../tiptap/components/TiptapContent.svelte';
import './editor.css';
import mermaid from 'mermaid';
import { MathBlock, Link, MathInline, TableColMenu, TableRowMenu } from './components/menu/index.js';
import { mode } from 'mode-watcher';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Editor($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, '');

	mermaid.initialize({
		startOnLoad: false,
		theme: mode.current === 'dark' ? 'dark' : 'default',
		securityLevel: 'loose',
		fontFamily: 'inherit'
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Link(node, {});

	var node_1 = $.sibling(node, 2);

	MathBlock(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	MathInline(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	TableColMenu(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	TableRowMenu(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => cn('relative', className()));

		TiptapContent(node_5, {
			get class() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}