import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

export default function _page($$renderer) {
	const calloutCode = `// Command to toggle or apply callout block
editor.commands.setCallout();`;

	const markdownSyntax = `$callout 💡
This is a callout box with a custom lightbulb emoji!
$`;

	const inputRule = `$callout ⚠️ `;

	$.head('1egrfmi', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Callouts | Edra Docs</title>`);
		});
	});

	$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>Callouts Extension</h1> <p class="lead">Highlight key information, warnings, or tips in your documents with customizable callout blocks
		rendered using custom Svelte components.</p> <hr class="my-6"/> <h2>Usage</h2> <p>The <code>Callout</code> extension is a custom TipTap Node that integrates a Svelte component view.
		It supports emojis, draggable states, and custom markdown rendering.</p> <div class="my-4">`);

	Code($$renderer, { code: calloutCode, language: 'typescript' });
	$$renderer.push(`<!----></div> <h2>Markdown Syntax &amp; Parsing</h2> <p>Edra automatically parses callouts from markdown strings using a custom dollar-sign wrap syntax:</p> <div class="my-4">`);
	Code($$renderer, { code: markdownSyntax, language: 'markdown' });

	$$renderer.push(`<!----></div> <h2>Input Rules</h2> <p>You can instantly create a callout in the editor by typing <code>$callout</code> followed by an
		optional emoji and a space (e.g. <code>$callout ⚠️</code>) at the start of any new paragraph.</p> <div class="my-4">`);

	Code($$renderer, { code: inputRule, language: 'markdown' });

	$$renderer.push(`<!----></div> <h2>Node Customization</h2> <p>The node view handles custom emoji Pickers, background color matching based on your theme, and
		draggable handles to move callout boxes easily in your doc layout.</p> <div class="mt-12 flex justify-between">`);

	Button($$renderer, {
		href: '/docs/extensions/media-and-mermaid',
		variant: 'outline',
		class: 'gap-2',
		children: ($$renderer) => {
			ArrowLeft($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> Back to Media &amp; Mermaid`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/docs/extensions/drag-handle',
		class: 'gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Drag Handle `);
			ArrowRight($$renderer, { class: 'size-4' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></article>`);
}