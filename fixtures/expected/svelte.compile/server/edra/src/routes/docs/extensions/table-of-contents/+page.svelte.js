import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import { usageCode } from './code.ts';

export default function _page($$renderer) {
	const importCode = `import { ToC } from '$lib/edra/shadcn/index.js';`;

	$.head('143n1gd', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Table of Contents | Edra Docs</title>`);
		});
	});

	$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>Table of Contents</h1> <p class="lead">Automatically generate a reactive, scroll-spy capable Table of Contents sidebar for your
		documents.</p> <hr class="my-6"/> <h2>Overview</h2> <p>Edra uses the <code>@tiptap-pro/extension-table-of-contents</code> (or its open-source
		equivalent logic) to extract hierarchical headers from the document. The editor state tracks all <code>h1</code>, <code>h2</code>, <code>h3</code>, and <code>h4</code> tags, mapping them to their
		respective positions in the document.</p> <p>To visualize this data, Edra provides a fully-styled <code>ToC</code> component that you can place
		anywhere in your layout (usually in a sidebar beside the editor).</p> <hr class="my-6"/> <h2>Usage</h2> <p>Import the <code>ToC</code> component from the Edra package:</p> <div class="my-4">`);

	Code($$renderer, { code: importCode, language: 'ts' });

	$$renderer.push(`<!----></div> <p>Simply pass your instantiated <code>editor</code> object as a prop to the <code>ToC</code> component.
		It will automatically listen for document updates, regenerate the outline, and apply active styling
		to the heading currently visible in the viewport (Scroll Spy).</p> <div class="my-4">`);

	Code($$renderer, { code: usageCode, language: 'svelte' });
	$$renderer.push(`<!----></div> <div class="mt-12 flex justify-between">`);

	Button($$renderer, {
		href: '/docs/extensions/mathematics',
		variant: 'outline',
		class: 'gap-2',
		children: ($$renderer) => {
			ArrowLeft($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----> Mathematics`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/docs/extensions/markdown',
		class: 'gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Markdown `);
			ArrowRight($$renderer, { class: 'size-4' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></article>`);
}