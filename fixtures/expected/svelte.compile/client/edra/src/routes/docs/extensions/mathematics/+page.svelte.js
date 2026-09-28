import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Typography`, 1);
var root_1 = $.from_html(`Markdown Extension <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Mathematics (LaTeX / KaTeX)</h1> <p class="lead">Render publication-grade math formulas directly inside the editor using LaTeX syntax and KaTeX.</p> <hr class="my-6"/> <h2>Configuration</h2> <p>The math extension uses <code>@tiptap/extension-mathematics</code> as a wrapper around the super
		fast <code>katex</code> renderer. Edra pre-configures standard options and macros (such as <code>\\R</code> and <code>\\N</code>) globally in <code>extensions.ts</code>:</p> <div class="my-4"><!></div> <h2>How to use in Editor</h2> <p>To write math equations, wrap your LaTeX string in dollar signs:</p> <ul class="mt-4 list-disc space-y-2 pl-6"><li><strong>Inline Math:</strong> Wrap with single dollar signs (e.g. <code>$a^2 + b^2 = c^2$</code>). When you type the closing dollar sign, it compiles
			immediately.</li> <li><strong>Block Math:</strong> Wrap with double dollar signs (e.g. <code>$$E = mc^2$$</code>) to
			render equations on a separate centered line.</li></ul> <div class="my-4"><!></div> <h2>Styles</h2> <p>To output rendering properly, make sure KaTeX styles are imported. Edra takes care of standard
		layout alignments, rendering overlays, and mathematical symbols so that equations look correct
		in both light and dark modes.</p> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const configCode = `import Mathematics from '@tiptap/extension-mathematics';

Mathematics.configure({
	katexOptions: {
		throwOnError: false,
		macros: {
			'\\\\R': '\\\\mathbb{R}',
			'\\\\N': '\\\\mathbb{N}'
		}
	}
})`;

	const exampleEquation = `$$f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi) e^{2 \\pi i x \\xi} d\\xi$$`;
	var article = root_2();

	$.head('h48y44', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Mathematics | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: configCode, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 8);
	var node_1 = $.child(div_1);

	Code(node_1, { code: exampleEquation, language: 'latex' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 6);
	var node_2 = $.child(div_2);

	Button(node_2, {
		href: '/docs/extensions/typography-and-colors',
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
		href: '/docs/extensions/markdown',
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