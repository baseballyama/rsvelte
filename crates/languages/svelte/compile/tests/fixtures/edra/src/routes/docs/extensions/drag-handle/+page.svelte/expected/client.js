import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import { setUpCode } from './code.ts';

var root = $.from_html(`<!> Back to Callouts`, 1);
var root_1 = $.from_html(`Codeblock <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Drag Handle Extension</h1> <p class="lead">Rearrange content blocks, select full lines, apply formatting, and invoke block-level commands
		via hover handles.</p> <hr class="my-6"/> <h2>Overview</h2> <p>The drag handle hover container is powered by <code>@tiptap/extension-drag-handle</code>. Edra
		encapsulates this with a custom dropdown menu that follows the cursor as you hover over
		paragraphs, headings, code blocks, lists, and tables.</p> <h2>Setup</h2> <p>To enable the drag handle interface, simply place the <code>&lt;Edra.DragHandle /&gt;</code> element inside the main <code>&lt;Edra&gt;</code> wrapping block:</p> <div class="my-4"><!></div> <h2>Key Actions in Hover Dropdown</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Block Movement:</strong> Press, hold, and drag the handle icon to physically reposition
			paragraphs, list items, or blocks anywhere else in the document.</li> <li><strong>Content Switcher:</strong> Click the plus (<code>+</code>) menu to add new blocks or
			convert the current line into a Heading, Checklist, Bullet List, or Blockquote.</li> <li><strong>Node Actions:</strong> Quickly duplicate block content, copy text, delete elements, align
			text blocks, or remove inline styling formats.</li> <li><strong>AI Integration:</strong> If an AI provider is active, run custom prompt transformations
			directly on the hovered block.</li></ul> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	var article = root_2();

	$.head('1oabikx', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Drag Handle | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 14);
	var node = $.child(div);

	Code(node, {
		get code() {
			return setUpCode;
		},
		language: 'svelte'
	});

	$.reset(div);

	var div_1 = $.sibling(div, 6);
	var node_1 = $.child(div_1);

	Button(node_1, {
		href: '/docs/extensions/callout',
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
		href: '/docs/extensions/code-block',
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