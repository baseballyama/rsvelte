import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import { usageCode } from './code.ts';

var root = $.from_html(`<!> Mathematics`, 1);
var root_1 = $.from_html(`Markdown <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Table of Contents</h1> <p class="lead">Automatically generate a reactive, scroll-spy capable Table of Contents sidebar for your
		documents.</p> <hr class="my-6"/> <h2>Overview</h2> <p>Edra uses the <code>@tiptap-pro/extension-table-of-contents</code> (or its open-source
		equivalent logic) to extract hierarchical headers from the document. The editor state tracks all <code>h1</code>, <code>h2</code>, <code>h3</code>, and <code>h4</code> tags, mapping them to their
		respective positions in the document.</p> <p>To visualize this data, Edra provides a fully-styled <code>ToC</code> component that you can place
		anywhere in your layout (usually in a sidebar beside the editor).</p> <hr class="my-6"/> <h2>Usage</h2> <p>Import the <code>ToC</code> component from the Edra package:</p> <div class="my-4"><!></div> <p>Simply pass your instantiated <code>editor</code> object as a prop to the <code>ToC</code> component.
		It will automatically listen for document updates, regenerate the outline, and apply active styling
		to the heading currently visible in the viewport (Scroll Spy).</p> <div class="my-4"><!></div> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const importCode = `import { ToC } from '$lib/edra/shadcn/index.js';`;
	var article = root_2();

	$.head('143n1gd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Table of Contents | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 18);
	var node = $.child(div);

	Code(node, { code: importCode, language: 'ts' });
	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var node_1 = $.child(div_1);

	Code(node_1, {
		get code() {
			return usageCode;
		},
		language: 'svelte'
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Button(node_2, {
		href: '/docs/extensions/mathematics',
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