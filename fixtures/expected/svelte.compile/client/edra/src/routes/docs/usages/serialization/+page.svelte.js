import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Usages`, 1);
var root_1 = $.from_html(`Starter Kit <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Data & Serialization</h1> <p class="lead">Extracting, saving, and loading content in JSON, HTML, or Markdown formats.</p> <hr class="my-6"/> <h2>JSON (Recommended)</h2> <p>The most robust way to store Edra's content is by using TipTap's native JSON format. JSON
		perfectly captures all nested attributes, extensions, node configurations (like image alignments
		or cell widths in tables), and custom marks.</p> <div class="my-4"><!></div> <div class="callout my-6 rounded-md border-l-4 border-l-blue-500 bg-blue-500/10 p-4"><p class="m-0 font-medium text-blue-700 dark:text-blue-400">Why JSON over HTML?</p> <p class="m-0 mt-2 text-sm">HTML serialization relies on parsing tags and attributes, which can sometimes result in lost
			data if the DOM changes or if specific inline styles are stripped by sanitizers. JSON provides
			a guaranteed 1:1 mapping of your editor state.</p></div> <hr class="my-6"/> <h2>HTML</h2> <p>If you need to render the document's content in an email template or a simplified frontend
		reader, extracting it as raw HTML is incredibly useful.</p> <div class="my-4"><!></div> <hr class="my-6"/> <h2>Markdown</h2> <p>Edra integrates <code>@tiptap/markdown</code>, allowing seamless conversion between Markdown and
		the rich text editor state. This is highly useful for Git-backed CMSs or legacy integrations.</p> <div class="my-4"><!></div> <p>Note that Markdown does not natively support all of Edra's advanced extensions (like media
		alignment, custom iframe styling, or text colors). When serializing to Markdown, these advanced
		attributes may be stripped.</p> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
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

	var article = root_2();

	$.head('1o81c98', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Data & Serialization | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: jsonCode, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 10);
	var node_1 = $.child(div_1);

	Code(node_1, { code: htmlCode, language: 'typescript' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 8);
	var node_2 = $.child(div_2);

	Code(node_2, { code: markdownCode, language: 'typescript' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 4);
	var node_3 = $.child(div_3);

	Button(node_3, {
		href: '/docs/usages',
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
		href: '/docs/extensions/starter-kit',
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