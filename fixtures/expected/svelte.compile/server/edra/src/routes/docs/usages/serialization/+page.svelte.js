import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

export default function _page($$renderer) {
	const jsonCode = `// Extract the document as a structured JSON AST
const data = editor.getJSON();

// Load the document back from JSON
editor.commands.setContent(data);`;

	const htmlCode = `// Extract the document as an HTML string
const html = editor.getHTML();

// Load the document back from HTML
editor.commands.setContent(html);`;

	const markdownCode = `// Extract the document as Markdown
// Ensure the Markdown extension is loaded in your extensions list!
const markdown = editor.getMarkdown();

// Load the document back from Markdown
editor.commands.setContent(markdown);`;

	$.head('1o81c98', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Data &amp; Serialization | Edra Docs</title>`);
		});
	});

	$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>Data &amp; Serialization</h1> <p class="lead">Extracting, saving, and loading content in JSON, HTML, or Markdown formats.</p> <hr class="my-6"/> <h2>JSON (Recommended)</h2> <p>The most robust way to store Edra's content is by using TipTap's native JSON format. JSON
		perfectly captures all nested attributes, extensions, node configurations (like image alignments
		or cell widths in tables), and custom marks.</p> <div class="my-4">`);

	Code($$renderer, { code: jsonCode, language: 'typescript' });

	$$renderer.push(`<!----></div> <div class="callout my-6 rounded-md border-l-4 border-l-blue-500 bg-blue-500/10 p-4"><p class="m-0 font-medium text-blue-700 dark:text-blue-400">Why JSON over HTML?</p> <p class="m-0 mt-2 text-sm">HTML serialization relies on parsing tags and attributes, which can sometimes result in lost
			data if the DOM changes or if specific inline styles are stripped by sanitizers. JSON provides
			a guaranteed 1:1 mapping of your editor state.</p></div> <hr class="my-6"/> <h2>HTML</h2> <p>If you need to render the document's content in an email template or a simplified frontend
		reader, extracting it as raw HTML is incredibly useful.</p> <div class="my-4">`);

	Code($$renderer, { code: htmlCode, language: 'typescript' });

	$$renderer.push(`<!----></div> <hr class="my-6"/> <h2>Markdown</h2> <p>Edra integrates <code>@tiptap/markdown</code>, allowing seamless conversion between Markdown and
		the rich text editor state. This is highly useful for Git-backed CMSs or legacy integrations.</p> <div class="my-4">`);

	Code($$renderer, { code: markdownCode, language: 'typescript' });

	$$renderer.push(`<!----></div> <p>Note that Markdown does not natively support all of Edra's advanced extensions (like media
		alignment, custom iframe styling, or text colors). When serializing to Markdown, these advanced
		attributes may be stripped.</p> <div class="mt-12 flex justify-between">`);

	Button($$renderer, {
		href: '/docs/usages',
		variant: 'outline',
		class: 'gap-2',
		children: ($$renderer) => {
			ArrowLeft($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> Usages`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/docs/extensions/starter-kit',
		class: 'gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Starter Kit `);
			ArrowRight($$renderer, { class: 'size-4' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></article>`);
}