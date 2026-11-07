import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import { resolve } from '$app/paths';

var root = $.from_html(`<!> Back to Slash Command`, 1);

var root_1 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Customizing Extensions</h1> <p class="lead">Learn how to modify, add, or configure TipTap extensions and custom Svelte node view components.</p> <hr class="my-6"/> <h2>1. Modifying Default Extensions</h2> <p>Edra pre-configures standard editing tools globally. To add your own custom TipTap extensions,
		configure settings, or remove default plugins, edit the following file:</p> <p>👉 <strong>File to modify:</strong> <code>src/lib/edra/extensions.ts</code></p> <div class="my-4"><!></div> <h2>2. Custom Svelte Component Views (Node Views)</h2> <p>For complex elements (like Callout, Codeblock, Iframe, or Mermaid), Edra uses Svelte to render
		and interact with the node view. You can customize the styling and layout of these components:</p> <h3>Shadcn UI Flavor</h3> <p>👉 <strong>File mapping:</strong> <code>src/lib/edra/shadcn/editor.ts</code></p> <p>👉 <strong>Components folder:</strong> <code>src/lib/edra/shadcn/components/*</code></p> <div class="my-4"><!></div> <h3>Headless UI Flavor</h3> <p>👉 <strong>File mapping:</strong> <code>src/lib/edra/headless/editor.ts</code></p> <p>👉 <strong>Components folder:</strong> <code>src/lib/edra/headless/components/*</code></p> <h2>3. Customizing the Toolbar</h2> <p>If you are using the Shadcn UI flavor and want to change, rearrange, or remove buttons on the
		main toolbar, modify:</p> <p>👉 <strong>File to modify:</strong> <code>src/lib/edra/shadcn/components/Toolbar.svelte</code></p> <h2>4. Typography & Styling</h2> <p>Edra inherits typography styles from your global Svelte application but also supports granular,
		flavor-specific design customizations (CSS classes, custom CSS variables, and stylesheets).</p> <p>👉 <strong>Learn more here:</strong> <a>Typography & Styling Docs</a></p> <div class="mt-12 flex"><!></div></article>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const extensionFile = `// src/lib/edra/extensions.ts
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';

export default [
	StarterKit.configure({
		heading: { levels: [1, 2, 3] }
	}),
	Highlight.configure({ multicolor: true })
	// Add your new TipTap extensions here!
];`;

	const rendererRegister = `// src/lib/edra/shadcn/editor.ts
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import CodeBlock from './components/CodeBlock.svelte';
import { SvelteNodeViewRenderer } from '../tiptap/index.ts';

export const createEditor = (props) =>
	useEditor({
		extensions: [
			...extensions,
			CodeBlockLowlight.configure({ lowlight }).extend({
				addNodeView() {
					return SvelteNodeViewRenderer(CodeBlock); // Bind custom Svelte component
				}
			})
		]
	});`;

	var article = root_1();

	$.head('rss26a', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Customizing Extensions | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 12);
	var node = $.child(div);

	Code(node, { code: extensionFile, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 12);
	var node_1 = $.child(div_1);

	Code(node_1, { code: rendererRegister, language: 'typescript' });
	$.reset(div_1);

	var p = $.sibling(div_1, 18);
	var a = $.sibling($.child(p), 3);

	$.reset(p);

	var div_2 = $.sibling(p, 2);
	var node_2 = $.child(div_2);

	{
		let $0 = $.derived(() => resolve('/docs/extensions/slash-command'));

		Button(node_2, {
			get href() {
				return $.get($0);
			},
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
	}

	$.reset(div_2);
	$.reset(article);
	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => resolve('/docs/customization/styling')]);
	$.append($$anchor, article);
	$.pop();
}