import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Drag Handle`, 1);
var root_1 = $.from_html(`AI Assistant <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Codeblock Extension</h1> <p class="lead">Format program snippets with multi-language syntax highlighting, a copy-to-clipboard trigger,
		and interactive diagram conversion.</p> <hr class="my-6"/> <h2>Configuration</h2> <p>The editor wraps TipTap's standard <code>CodeBlockLowlight</code> extension, configuring it with
		the lightweight <code>lowlight</code> highlighter, and overlays it with a premium Svelte Node
		View component (<code>CodeBlock.svelte</code>).</p> <div class="my-4"><!></div> <h2>Included Features</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Multi-Language Highlight:</strong> Automatically detects languages or lets users select
			the syntax format using a clean, search-enabled Popover dropdown.</li> <li><strong>Mermaid Conversion:</strong> When the code block is set to <code>mermaid</code>, a
			one-click convert option appears to render your code into a visual flowchart or sequence
			diagram immediately.</li> <li><strong>Copy Button:</strong> An inline clipboard button lets readers duplicate code blocks instantly.</li> <li><strong>Editable Code Area:</strong> Full control to add, edit, or adjust syntax within standard
			HTML pre/code elements without breaking layout hierarchy.</li></ul> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const codeblockSnippet = `// Run command to insert or toggle a code block:
editor.chain().focus().toggleCodeBlock().run();`;

	var article = root_2();

	$.head('ybuhj3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Codeblock | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: codeblockSnippet, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 6);
	var node_1 = $.child(div_1);

	Button(node_1, {
		href: '/docs/extensions/drag-handle',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			ArrowLeft(node_2, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	Button(node_3, {
		href: '/docs/extensions/ai',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_4 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_4, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(article);
	$.append($$anchor, article);
}