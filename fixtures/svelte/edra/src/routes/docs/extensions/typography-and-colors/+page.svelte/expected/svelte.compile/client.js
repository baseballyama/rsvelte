import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Task List`, 1);
var root_1 = $.from_html(`Mathematics Extension <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Typography & Colors</h1> <p class="lead">Take complete control of font styling, sizes, text alignment, highlights, and custom colors.</p> <hr class="my-6"/> <h2>Configuration</h2> <p>Typography controls are powered by TipTap's standard styling and typography packages. The font
		sizes, colors, subscripts, and superscripts are integrated directly:</p> <div class="my-4"><!></div> <h2>Common Formatting Commands</h2> <p>Apply font attributes and alignments to selected text programmatically via:</p> <div class="my-4"><!></div> <h2>Included Extensions</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Text Align:</strong> Allows aligning paragraphs and headings to <code>left</code>, <code>center</code>, <code>right</code>, or <code>justify</code>.</li> <li><strong>Highlighter:</strong> Supports highlighting text with multiple custom background colors.</li> <li><strong>Subscript & Superscript:</strong> Subscript (<code>sub</code>) and Superscript (<code>sup</code>) marks for chemical formulas, math exponents, or footnote citations.</li> <li><strong>Typography Extension:</strong> Automatically replaces characters with typography
			equivalents (e.g. converting <code>--</code> to <code>—</code> or <code>-></code> to <code>→</code>).</li></ul> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const typographyCode = `import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

// Configuration in extensions.ts
TextStyle,
FontSize,
Color,
Highlight.configure({ multicolor: true }),
TextAlign.configure({
	types: ['heading', 'paragraph']
})`;

	const commandsCode = `// Set Text Color
editor.chain().focus().setColor('#ef4444').run();

// Set Font Size
editor.chain().focus().setFontSize('18px').run();

// Align Text
editor.chain().focus().setTextAlign('center').run();`;

	var article = root_2();

	$.head('iln5bu', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Typography & Colors | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: typographyCode, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 6);
	var node_1 = $.child(div_1);

	Code(node_1, { code: commandsCode, language: 'typescript' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 6);
	var node_2 = $.child(div_2);

	Button(node_2, {
		href: '/docs/extensions/tasks',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			ArrowLeft(node_3, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		href: '/docs/extensions/mathematics',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_5 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_5, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(article);
	$.append($$anchor, article);
}