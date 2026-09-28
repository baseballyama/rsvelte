import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

export default function _page($$renderer) {
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

	$.head('iln5bu', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Typography &amp; Colors | Edra Docs</title>`);
		});
	});

	$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>Typography &amp; Colors</h1> <p class="lead">Take complete control of font styling, sizes, text alignment, highlights, and custom colors.</p> <hr class="my-6"/> <h2>Configuration</h2> <p>Typography controls are powered by TipTap's standard styling and typography packages. The font
		sizes, colors, subscripts, and superscripts are integrated directly:</p> <div class="my-4">`);

	Code($$renderer, { code: typographyCode, language: 'typescript' });
	$$renderer.push(`<!----></div> <h2>Common Formatting Commands</h2> <p>Apply font attributes and alignments to selected text programmatically via:</p> <div class="my-4">`);
	Code($$renderer, { code: commandsCode, language: 'typescript' });

	$$renderer.push(`<!----></div> <h2>Included Extensions</h2> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Text Align:</strong> Allows aligning paragraphs and headings to <code>left</code>, <code>center</code>, <code>right</code>, or <code>justify</code>.</li> <li><strong>Highlighter:</strong> Supports highlighting text with multiple custom background colors.</li> <li><strong>Subscript &amp; Superscript:</strong> Subscript (<code>sub</code>) and Superscript (<code>sup</code>) marks for chemical formulas, math exponents, or footnote citations.</li> <li><strong>Typography Extension:</strong> Automatically replaces characters with typography
			equivalents (e.g. converting <code>--</code> to <code>—</code> or <code>-></code> to <code>→</code>).</li></ul> <div class="mt-12 flex justify-between">`);

	Button($$renderer, {
		href: '/docs/extensions/tasks',
		variant: 'outline',
		class: 'gap-2',
		children: ($$renderer) => {
			ArrowLeft($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> Back to Task List`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/docs/extensions/mathematics',
		class: 'gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Mathematics Extension `);
			ArrowRight($$renderer, { class: 'size-4' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></article>`);
}