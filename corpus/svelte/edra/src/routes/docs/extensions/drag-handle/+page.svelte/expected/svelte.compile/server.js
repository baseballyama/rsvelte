import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import { setUpCode } from './code.ts';

export default function _page($$renderer) {
	$.head('1oabikx', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Drag Handle | Edra Docs</title>`);
		});
	});

	$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>Drag Handle Extension</h1> <p class="lead">Rearrange content blocks, select full lines, apply formatting, and invoke block-level commands
		via hover handles.</p> <hr class="my-6"/> <h2>Overview</h2> <p>The drag handle hover container is powered by <code>@tiptap/extension-drag-handle</code>. Edra
		encapsulates this with a custom dropdown menu that follows the cursor as you hover over
		paragraphs, headings, code blocks, lists, and tables.</p> <h2>Setup</h2> <p>To enable the drag handle interface, simply place the <code>&lt;Edra.DragHandle /></code> element inside the main <code>&lt;Edra></code> wrapping block:</p> <div class="my-4">`);

	Code($$renderer, { code: setUpCode, language: 'svelte' });

	$$renderer.push(`<!----></div> <h2>Key Actions in Hover Dropdown</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Block Movement:</strong> Press, hold, and drag the handle icon to physically reposition
			paragraphs, list items, or blocks anywhere else in the document.</li> <li><strong>Content Switcher:</strong> Click the plus (<code>+</code>) menu to add new blocks or
			convert the current line into a Heading, Checklist, Bullet List, or Blockquote.</li> <li><strong>Node Actions:</strong> Quickly duplicate block content, copy text, delete elements, align
			text blocks, or remove inline styling formats.</li> <li><strong>AI Integration:</strong> If an AI provider is active, run custom prompt transformations
			directly on the hovered block.</li></ul> <div class="mt-12 flex justify-between">`);

	Button($$renderer, {
		href: '/docs/extensions/callout',
		variant: 'outline',
		class: 'gap-2',
		children: ($$renderer) => {
			ArrowLeft($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> Back to Callouts`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/docs/extensions/code-block',
		class: 'gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Codeblock `);
			ArrowRight($$renderer, { class: 'size-4' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></article>`);
}