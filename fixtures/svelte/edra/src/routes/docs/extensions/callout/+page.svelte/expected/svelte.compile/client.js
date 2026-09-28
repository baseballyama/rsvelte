import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Media & Mermaid`, 1);
var root_1 = $.from_html(`Drag Handle <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Callouts Extension</h1> <p class="lead">Highlight key information, warnings, or tips in your documents with customizable callout blocks
		rendered using custom Svelte components.</p> <hr class="my-6"/> <h2>Usage</h2> <p>The <code>Callout</code> extension is a custom TipTap Node that integrates a Svelte component view.
		It supports emojis, draggable states, and custom markdown rendering.</p> <div class="my-4"><!></div> <h2>Markdown Syntax & Parsing</h2> <p>Edra automatically parses callouts from markdown strings using a custom dollar-sign wrap syntax:</p> <div class="my-4"><!></div> <h2>Input Rules</h2> <p>You can instantly create a callout in the editor by typing <code>$callout</code> followed by an
		optional emoji and a space (e.g. <code>$callout ⚠️</code>) at the start of any new paragraph.</p> <div class="my-4"><!></div> <h2>Node Customization</h2> <p>The node view handles custom emoji Pickers, background color matching based on your theme, and
		draggable handles to move callout boxes easily in your doc layout.</p> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const calloutCode = `// Command to toggle or apply callout block
editor.commands.setCallout();`;

	const markdownSyntax = `$callout 💡
This is a callout box with a custom lightbulb emoji!
$`;

	const inputRule = `$callout ⚠️ `;
	var article = root_2();

	$.head('1egrfmi', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Callouts | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: calloutCode, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 6);
	var node_1 = $.child(div_1);

	Code(node_1, { code: markdownSyntax, language: 'markdown' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 6);
	var node_2 = $.child(div_2);

	Code(node_2, { code: inputRule, language: 'markdown' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 6);
	var node_3 = $.child(div_3);

	Button(node_3, {
		href: '/docs/extensions/media-and-mermaid',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_4 = $.first_child(fragment);

			ArrowLeft(node_4, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_3, 2);

	Button(node_5, {
		href: '/docs/extensions/drag-handle',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_6 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_6, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(article);
	$.append($$anchor, article);
}